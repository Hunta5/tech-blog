package com.hunta.myblog.model;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "blog_posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 标题
    @Column(nullable = false)
    private String title;

    // URL slug（唯一值，后面可加 unique）
    @Column(nullable = false)
    private String slug;

    // 正文
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // 摘要（可为空）
    @Column(columnDefinition = "TEXT")
    private String summary;

    // draft / published
    @Column(nullable = false)
    private String status;

    // 发布时间
    @Column(name = "published_at", nullable = false)
    private LocalDateTime publishedAt;

    // 作者 ID（后期可升级为 @ManyToOne）
    @Column(name = "author_id", nullable = false)
    private Long authorId;

    // 阅读数
    @Column(name = "view_count", nullable = false)
    private Long viewCount;

    // 创建时间
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // 更新时间
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 软删除时间
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}