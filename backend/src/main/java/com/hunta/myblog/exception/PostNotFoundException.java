package com.hunta.myblog.exception;

public class PostNotFoundException extends RuntimeException {

    public PostNotFoundException(Long id) {
        super("Post not found: " + id);
    }

    public PostNotFoundException(String slug) {
        super("Post not found: " + slug);
    }
}