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
              .allowedOrigins("http://13.209.60.49:3000", "https://scalping.app", "https://www.scalping.app") // 리액트 앱의 주소
//                .allowedOrigins("http://localhost:3000", "https://scalping.app", "https://www.scalping.app") // 리액트 앱의 주소
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
