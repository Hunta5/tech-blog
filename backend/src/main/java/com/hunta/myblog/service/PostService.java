package com.hunta.myblog.service;

import com.hunta.myblog.dto.PostCreateRequest;
import com.hunta.myblog.dto.PostResponse;
import com.hunta.myblog.exception.PostNotFoundException;
import com.hunta.myblog.mapper.PostMapper;
import com.hunta.myblog.model.Post;
import com.hunta.myblog.repository.PostRepository;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class PostService {
    private final PostRepository repository;

    public PostService(PostRepository repository) {
        this.repository = repository;
    }

    public PostResponse create(PostCreateRequest request) {
        Post post = PostMapper.toEntity(request);
        return PostMapper.toResponse(repository.save(post));
    }

    public List<PostResponse> findAll(){
        return repository.findAll()
                .stream()
                .map(PostMapper::toResponse)
                .toList();
    }

    public PostResponse findById(Long id){
        Post post = repository.findById(id).orElseThrow(()-> new PostNotFoundException(id));
        return PostMapper.toResponse(post);
    }
}
