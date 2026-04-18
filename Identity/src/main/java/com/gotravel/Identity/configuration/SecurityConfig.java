package com.gotravel.Identity.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private String[] PUBLICURLPOST = {
            "/api/users",
    };
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http.authorizeHttpRequests(
                    request ->
                            request.requestMatchers(HttpMethod.POST ,PUBLICURLPOST).permitAll()
                                    .requestMatchers(HttpMethod.GET, "/api/users/**").permitAll() 
                                    .requestMatchers("/error").permitAll()
                                    .anyRequest().authenticated()
            );
            http.csrf(AbstractHttpConfigurer::disable);
            return http.build();
    }
}