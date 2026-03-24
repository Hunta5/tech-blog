package com.hunta.myblog.service;

import com.hunta.myblog.dto.NewsItem;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
public class NewsService {

    // ---- RSS Feed Sources ----
    private static final Map<String, List<FeedSource>> CATEGORY_FEEDS = Map.of(
        "world", List.of(
            new FeedSource("Reuters", "https://feeds.reuters.com/reuters/topNews", "en"),
            new FeedSource("BBC", "https://feeds.bbci.co.uk/news/world/rss.xml", "en"),
            new FeedSource("CNN", "http://rss.cnn.com/rss/edition_world.rss", "en")
        ),
        "tech", List.of(
            new FeedSource("TechCrunch", "https://techcrunch.com/feed/", "en"),
            new FeedSource("The Verge", "https://www.theverge.com/rss/index.xml", "en"),
            new FeedSource("Ars Technica", "https://feeds.arstechnica.com/arstechnica/index", "en")
        ),
        "business", List.of(
            new FeedSource("Reuters Business", "https://feeds.reuters.com/reuters/businessNews", "en"),
            new FeedSource("BBC Business", "https://feeds.bbci.co.uk/news/business/rss.xml", "en")
        ),
        "science", List.of(
            new FeedSource("BBC Science", "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml", "en"),
            new FeedSource("NASA", "https://www.nasa.gov/rss/dyn/breaking_news.rss", "en")
        ),
        "korea", List.of(
            new FeedSource("연합뉴스", "https://www.yonhapnewstv.co.kr/browse/feed/", "ko"),
            new FeedSource("한겨레", "https://www.hani.co.kr/rss/", "ko"),
            new FeedSource("KBS", "https://world.kbs.co.kr/rss/rss_news.htm?lang=k", "ko")
        ),
        "china", List.of(
            new FeedSource("百度国内", "https://news.baidu.com/n?cmd=1&class=civilnews&tn=rss", "zh"),
            new FeedSource("百度国际", "https://news.baidu.com/n?cmd=1&class=internews&tn=rss", "zh"),
            new FeedSource("百度财经", "https://news.baidu.com/n?cmd=1&class=finannews&tn=rss", "zh"),
            new FeedSource("百度科技", "https://news.baidu.com/n?cmd=1&class=technnews&tn=rss", "zh")
        )
    );

    // In-memory cache: category -> list of news items
    private final Map<String, List<NewsItem>> cache = new ConcurrentHashMap<>();
    private volatile long lastFetchTime = 0;

    private static final long CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes
    private static final int MAX_ITEMS_PER_CATEGORY = 15;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.ALWAYS)
            .build();

    @PostConstruct
    public void init() {
        // Fetch on startup
        fetchAllFeeds();
    }

    // Refresh every 30 minutes
    @Scheduled(fixedRate = 1800000) // 30 min
    public void scheduledFetch() {
        fetchAllFeeds();
    }

    public List<NewsItem> getNews(String category, int limit) {
        if (category == null || category.equals("all")) {
            // Merge all categories, sort by date, limit
            return cache.values().stream()
                    .flatMap(Collection::stream)
                    .sorted(Comparator.comparing(NewsItem::getPublishedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                    .limit(limit)
                    .collect(Collectors.toList());
        }

        List<NewsItem> items = cache.getOrDefault(category, Collections.emptyList());
        return items.stream().limit(limit).collect(Collectors.toList());
    }

    public List<String> getCategories() {
        return List.of("all", "world", "tech", "business", "science", "korea", "china");
    }

    private void fetchAllFeeds() {
        log.info("Fetching RSS feeds...");

        for (Map.Entry<String, List<FeedSource>> entry : CATEGORY_FEEDS.entrySet()) {
            String category = entry.getKey();
            List<FeedSource> sources = entry.getValue();

            List<NewsItem> items = new ArrayList<>();
            for (FeedSource source : sources) {
                try {
                    List<NewsItem> fetched = fetchFeed(source, category);
                    items.addAll(fetched);
                } catch (Exception e) {
                    log.warn("Failed to fetch RSS from {}: {}", source.name, e.getMessage());
                }
            }

            // Sort by date and limit
            items.sort(Comparator.comparing(NewsItem::getPublishedAt, Comparator.nullsLast(Comparator.reverseOrder())));
            if (items.size() > MAX_ITEMS_PER_CATEGORY) {
                items = items.subList(0, MAX_ITEMS_PER_CATEGORY);
            }

            cache.put(category, items);
        }

        lastFetchTime = System.currentTimeMillis();
        int total = cache.values().stream().mapToInt(List::size).sum();
        log.info("RSS fetch complete. Total: {} items across {} categories", total, cache.size());
    }

    private List<NewsItem> fetchFeed(FeedSource source, String category) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(source.url))
                .header("User-Agent", "Mozilla/5.0 (compatible; MyTechBlog/1.0)")
                .timeout(Duration.ofSeconds(10))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("HTTP " + response.statusCode());
        }

        SyndFeedInput input = new SyndFeedInput();
        SyndFeed feed = input.build(new XmlReader(
                new ByteArrayInputStream(response.body().getBytes(StandardCharsets.UTF_8)),
                true, "UTF-8"
        ));

        DateTimeFormatter formatter = DateTimeFormatter.ISO_OFFSET_DATE_TIME;
        List<NewsItem> items = new ArrayList<>();

        for (SyndEntry entry : feed.getEntries()) {
            String imageUrl = null;

            // Try to get image from enclosure
            if (entry.getEnclosures() != null && !entry.getEnclosures().isEmpty()) {
                String type = entry.getEnclosures().get(0).getType();
                if (type != null && type.startsWith("image")) {
                    imageUrl = entry.getEnclosures().get(0).getUrl();
                }
            }

            // Try media content via foreign markup
            if (imageUrl == null && entry.getForeignMarkup() != null) {
                for (var el : entry.getForeignMarkup()) {
                    if (el.getName().equals("content") || el.getName().equals("thumbnail")) {
                        String url = el.getAttributeValue("url");
                        if (url != null && (url.endsWith(".jpg") || url.endsWith(".png") || url.contains("image"))) {
                            imageUrl = url;
                            break;
                        }
                    }
                }
            }

            String publishedAt = null;
            if (entry.getPublishedDate() != null) {
                publishedAt = entry.getPublishedDate().toInstant()
                        .atZone(ZoneId.of("UTC"))
                        .format(formatter);
            } else if (entry.getUpdatedDate() != null) {
                publishedAt = entry.getUpdatedDate().toInstant()
                        .atZone(ZoneId.of("UTC"))
                        .format(formatter);
            }

            String description = "";
            if (entry.getDescription() != null) {
                description = entry.getDescription().getValue();
                // Strip HTML tags
                description = description.replaceAll("<[^>]+>", "").trim();
                if (description.length() > 200) {
                    description = description.substring(0, 200) + "...";
                }
            }

            items.add(NewsItem.builder()
                    .title(entry.getTitle())
                    .link(entry.getLink())
                    .description(description)
                    .source(source.name)
                    .category(category)
                    .imageUrl(imageUrl)
                    .publishedAt(publishedAt)
                    .build());
        }

        return items;
    }

    // ---- Inner class ----
    private record FeedSource(String name, String url, String lang) {}
}
