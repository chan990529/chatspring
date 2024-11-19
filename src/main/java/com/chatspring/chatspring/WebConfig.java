package com.chatspring.chatspring;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    public static final String ALLOWED_METHOD_NAMES = "GET,HEAD,POST,PUT,DELETE,TRACE,OPTIONS,PATCH";
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
              .allowedOrigins("http://13.209.60.49:80", "https://scalping.app", "https://www.scalping.app", "https://13.209.60.49:443")
//                .allowedOrigins("http://localhost:3000", "https://scalping.app", "https://www.scalping.app") // 리액트 앱의 주소
//                .allowedOriginPatterns("*")
                .allowedMethods(ALLOWED_METHOD_NAMES.split(","))
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
