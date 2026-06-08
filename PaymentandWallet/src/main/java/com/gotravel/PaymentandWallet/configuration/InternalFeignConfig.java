package com.gotravel.PaymentandWallet.configuration;

import feign.RequestInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class InternalFeignConfig {

    @Bean
    public RequestInterceptor internalServiceTokenRequestInterceptor(
            @Value("${internal.service.token:}") String internalServiceToken
    ) {
        return requestTemplate -> {
            if (!isInternalPath(requestTemplate.path())) {
                return;
            }

            String token = internalServiceToken == null ? "" : internalServiceToken.trim();
            if (!token.isEmpty()) {
                requestTemplate.header(InternalServiceTokenFilter.HEADER_NAME, token);
            }
        };
    }

    private boolean isInternalPath(String path) {
        if (path == null || path.isBlank()) {
            return false;
        }

        String normalizedPath = path.startsWith("/") ? path : "/" + path;
        return normalizedPath.equals("/api/v1/internal") || normalizedPath.startsWith("/api/v1/internal/");
    }
}
