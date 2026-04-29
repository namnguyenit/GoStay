package com.gotravel.Identity.service;

import com.gotravel.Identity.dto.request.AuthenticationRequest;
import com.gotravel.Identity.dto.response.AuthenticationResponse;
import com.gotravel.Identity.entity.User;
import com.gotravel.Identity.exception.AppException;
import com.gotravel.Identity.exception.AuthErrorCode;
import com.gotravel.Identity.exception.UserErrorCode;
import com.gotravel.Identity.repository.UserRepository;
import com.gotravel.Identity.configuration.RsaKeyConfig;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWTClaimsSet;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AuthenticationService {

    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    
    // Inject cấu hình RsaKeyConfig
    RsaKeyConfig rsaKeyConfig;

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));

        boolean checkpassword = passwordEncoder.matches(request.getPassword(),user.getPassword());
        if (!checkpassword) {
            throw new AppException(AuthErrorCode.UNAUTHENTICATED);
        }

        var token = generateToken(user);
        return AuthenticationResponse.builder()
                .token(token)
                .build();
    }

    // BƯỚC 3: SỬA HÀM TẠO TOKEN ĐỂ DÙNG PRIVATE KEY KÝ VÀO.
    private String generateToken(User user) {
        // Chuyển sang thuật toán RSA256, phải gắn kèm keyID để người phân loại (ở ngoài ai thích lấy thì gọi key này)
        JWSHeader header = new JWSHeader.Builder(JWSAlgorithm.RS256)
                .keyID("identity-key")
                .type(JOSEObjectType.JWT)
                .build();

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getId())
                .issuer("com.gotravel")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(1, ChronoUnit.HOURS).toEpochMilli()
                ))
                .claim("scope", buildScope(user))
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            // Bước 3.1: Sử dụng RSASSASigner và lấy cái Khóa Bí Mật Private ra ký vào nội dung
            jwsObject.sign(new RSASSASigner(rsaKeyConfig.getPrivateKey()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create token", e);
            throw new RuntimeException(e);
        }
    }

    private String buildScope(User user) {
        StringJoiner stringJoiner = new StringJoiner(" ");
        if (!CollectionUtils.isEmpty(user.getRoles())) {
            user.getRoles().forEach(role -> stringJoiner.add("ROLE_" + role.getName()));
        }
        return stringJoiner.toString();
    }
}
