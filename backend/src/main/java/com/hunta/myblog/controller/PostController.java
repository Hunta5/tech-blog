package com.hunta.myblog.controller;

import com.hunta.myblog.common.ApiResponse;
import com.hunta.myblog.dto.PostCreateRequest;
import com.hunta.myblog.dto.PostResponse;
import com.hunta.myblog.service.PostService;
import jakarta.validation.Valid;
import org.hibernate.dialect.unique.CreateTableUniqueDelegate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts")
public class PostController {
    private final PostService service;

    public PostController(PostService service){
        this.service = service;
    }

    @PostMapping
    public ApiResponse<PostResponse> create(@Valid @RequestBody PostCreateRequest request){
        return ApiResponse.success(service.create(request));
    }

    @GetMapping
    public ApiResponse<List<PostResponse>> list() {
        return ApiResponse.success(service.findAll());
    }

    @GetMapping("/{id}")
    public  ApiResponse<PostResponse> detail(@PathVariable Long id){
        return ApiResponse.success(service.findById(id));
    }
}
