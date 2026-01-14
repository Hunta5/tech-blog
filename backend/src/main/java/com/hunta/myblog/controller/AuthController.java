package com.hunta.myblog.controller;

import com.hunta.myblog.common.ApiResponse;
import com.hunta.myblog.dto.LoginRequest;
import com.hunta.myblog.dto.RegisterRequest;
import com.hunta.myblog.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final UserService userService;

    public AuthController(UserService userService){
        this.userService = userService;
    }

    @PostMapping("/login")
    public ApiResponse<String> login(@RequestBody LoginRequest request){
        String token = userService.login(request.getUsername(), request.getPassword());
        return ApiResponse.success(token);
    }

    @PostMapping("/register")
    public ApiResponse<Void> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        userService.register(request);
        return ApiResponse.success();
    }


}
