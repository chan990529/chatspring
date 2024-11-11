package com.chatspring.chatspring;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
              .allowedOrigins("https://13.209.60.49:80", "https://scalping.app", "https://www.scalping.app")
//                .allowedOrigins("http://localhost:3000", "https://scalping.app", "https://www.scalping.app") // 리액트 앱의 주소
//                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
