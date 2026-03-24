package com.hunta.myblog.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hunta.myblog.dto.BaiduHotItem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class BaiduHotService {

    // Baidu board tabs
    private static final Map<String, String> TABS = Map.of(
        "realtime", "realtime",       // 热搜榜
        "livelihood", "livelihood",   // 民生榜
        "finance", "finance"          // 财经榜
    );

    private static final String API_URL = "https://top.baidu.com/api/board?platform=pc&tab=";

    private final Map<String, List<BaiduHotItem>> cache = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.ALWAYS)
            .build();

    @PostConstruct
    public void init() {
        fetchAll();
    }

    // Refresh every 10 minutes (hot search changes fast)
    @Scheduled(fixedRate = 600000)
    public void scheduledFetch() {
        fetchAll();
    }

    public List<BaiduHotItem> getHotList(String tab) {
        return cache.getOrDefault(tab, Collections.emptyList());
    }

    public List<String> getTabs() {
        return List.of("realtime", "livelihood", "finance");
    }

    private void fetchAll() {
        log.info("Fetching Baidu hot search...");
        for (Map.Entry<String, String> entry : TABS.entrySet()) {
            try {
                List<BaiduHotItem> items = fetchTab(entry.getValue());
                cache.put(entry.getKey(), items);
                log.info("Baidu [{}]: {} items", entry.getKey(), items.size());
            } catch (Exception e) {
                log.warn("Failed to fetch Baidu [{}]: {}", entry.getKey(), e.getMessage());
            }
        }
    }

    private List<BaiduHotItem> fetchTab(String tab) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_URL + tab))
                .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
                .timeout(Duration.ofSeconds(10))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new RuntimeException("HTTP " + response.statusCode());
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode cards = root.path("data").path("cards");

        if (!cards.isArray() || cards.isEmpty()) {
            throw new RuntimeException("No cards in response");
        }

        // Navigate: cards[0].content[0].content[]
        JsonNode contentWrapper = cards.get(0).path("content");
        JsonNode items;

        if (contentWrapper.isArray() && !contentWrapper.isEmpty()) {
            JsonNode first = contentWrapper.get(0);
            if (first.has("content")) {
                items = first.path("content");
            } else {
                items = contentWrapper;
            }
        } else {
            throw new RuntimeException("Unexpected structure");
        }

        List<BaiduHotItem> result = new ArrayList<>();
        int rank = 1;

        for (JsonNode item : items) {
            String word = item.has("query") ? item.get("query").asText()
                        : item.has("word") ? item.get("word").asText() : "";

            if (word.isEmpty()) continue;

            // PC version uses "appUrl" (www.baidu.com), fallback to "url" (m.baidu.com)
            String url = item.has("appUrl") ? item.get("appUrl").asText()
                       : item.has("url") ? item.get("url").asText() : "";
            boolean isTop = item.has("isTop") && item.get("isTop").asBoolean();
            String hotTag = item.has("hotTag") ? item.get("hotTag").asText() : "";

            result.add(BaiduHotItem.builder()
                    .rank(rank++)
                    .word(word)
                    .url(url)
                    .isTop(isTop)
                    .hotTag(hotTag)
                    .build());

            if (rank > 30) break;
        }

        return result;
    }
}
