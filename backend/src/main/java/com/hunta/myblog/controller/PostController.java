package com.hunta.myblog.controller;

import com.hunta.myblog.common.ApiResponse;
import com.hunta.myblog.component.JwtUtil;
import com.hunta.myblog.dto.PostCreateRequest;
import com.hunta.myblog.dto.PostResponse;
import com.hunta.myblog.service.PostService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts")
public class PostController {
    private final PostService service;
    private final JwtUtil jwtUtil;

    public PostController(PostService service, JwtUtil jwtUtil) {
        this.service = service;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ApiResponse<PostResponse> create(
            @Valid @RequestBody PostCreateRequest request,
            HttpServletRequest httpRequest
    ) {
        requireAdmin(httpRequest);
        return ApiResponse.success(service.create(request));
    }

    @GetMapping
    public ApiResponse<List<PostResponse>> list() {
        return ApiResponse.success(service.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<PostResponse> detail(@PathVariable Long id) {
        return ApiResponse.success(service.findById(id));
    }

    @DeleteMapping("/{slug}")
    public ApiResponse<Void> delete(
            @PathVariable String slug,
            HttpServletRequest httpRequest
    ) {
        requireAdmin(httpRequest);
        service.deleteBySlug(slug);
        return ApiResponse.success();
    }

    private void requireAdmin(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            throw new RuntimeException("未登录");
        }
        String token = auth.substring(7);
        String role = jwtUtil.parseRole(token);
        if (!"admin".equals(role)) {
            throw new RuntimeException("无权限：仅管理员可操作");
        }
    }
}
