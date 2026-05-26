package com.gotravel.Identity.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.beans.factory.annotation.Value;
// BƯỚC 2: CẬP NHẬT PHẦN SECURITY. Mở cửa cho API JWKS và Decoder.
// Import cấu hình RSA vào
import com.gotravel.Identity.configuration.RsaKeyConfig;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final String[] PUBLIC_URL_POST = {
            "/api/users",
            "/api/auth/login"
    };

    private final String[] PUBLIC_URL_GET = {
            "/api/users/public/**",
            "/.well-known/jwks.json"// Cho phép gọi API lấy Public key hoàn toàn riêng tự do mà không cần Auth
    };

    private final RsaKeyConfig rsaKeyConfig;

    // Inject class ta vừa viết ở Bước 1 vào để lấy Key ra dùng
    public SecurityConfig(RsaKeyConfig rsaKeyConfig) {
        this.rsaKeyConfig = rsaKeyConfig;
    }

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            @Value("${internal.service.token:}") String internalServiceToken
    ) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers(HttpMethod.GET, "/api/users/internal/**").hasAuthority(InternalServiceTokenFilter.AUTHORITY)
                .requestMatchers(HttpMethod.POST, PUBLIC_URL_POST).permitAll()
                .requestMatchers(HttpMethod.GET, PUBLIC_URL_GET).permitAll()
                .requestMatchers("/error").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwtConfigurer -> jwtConfigurer
                    .decoder(jwtDecoder())
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
            ))
            .addFilterBefore(
                    new InternalServiceTokenFilter(internalServiceToken, "/api/users/internal"),
                    BearerTokenAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        // Identity service tự verify token bằng khóa Public, bỏ hẳn secret dạng MAC cũ.
        return NimbusJwtDecoder
                .withPublicKey(rsaKeyConfig.getPublicKey()) // Bước 2.1: Use public key!
                .build();
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);

        return jwtAuthenticationConverter;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(15);
    }
}
