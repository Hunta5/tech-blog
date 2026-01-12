package com.hunta.myblog.controller;

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
    public PostResponse create(@Valid @RequestBody PostCreateRequest request){
        return service.create(request);
    }

    @GetMapping
    public List<PostResponse> list(){
        return service.findAll();
    }

    @GetMapping("/{id}")
    public  PostResponse detail(@PathVariable Long id){
        return service.findById(id);
    }
}
