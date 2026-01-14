package com.hunta.myblog.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .formLogin(form -> form.disable())   // ❌ 关闭表单登录
                .httpBasic(basic -> basic.disable()) // ❌ 关闭 Basic Auth（弹窗来源）
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll() // 登录接口放行
                        .anyRequest().authenticated()
                );

        return http.build();
    }

}
