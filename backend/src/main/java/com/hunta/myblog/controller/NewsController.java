package com.hunta.myblog.controller;

import com.hunta.myblog.common.ApiResponse;
import com.hunta.myblog.dto.NewsItem;
import com.hunta.myblog.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    /**
     * GET /news?category=tech&limit=15
     */
    @GetMapping
    public ApiResponse<List<NewsItem>> getNews(
            @RequestParam(defaultValue = "all") String category,
            @RequestParam(defaultValue = "15") int limit
    ) {
        List<NewsItem> news = newsService.getNews(category, Math.min(limit, 50));
        return ApiResponse.success(news);
    }

    /**
     * GET /news/categories
     */
    @GetMapping("/categories")
    public ApiResponse<List<String>> getCategories() {
        return ApiResponse.success(newsService.getCategories());
    }
}
