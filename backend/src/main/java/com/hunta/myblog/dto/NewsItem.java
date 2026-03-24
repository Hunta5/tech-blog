package com.hunta.myblog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsItem {
    private String title;
    private String link;
    private String description;
    private String source;
    private String category;
    private String imageUrl;
    private String publishedAt;
}
