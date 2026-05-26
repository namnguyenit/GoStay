package com.gotravel.PaymentandWallet.configuration;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Locale;

@Component
@RequiredArgsConstructor
public class SepayWebhookVerifier {

    private static final String HMAC_SHA256 = "HMAC_SHA256";
    private static final String API_KEY = "API_KEY";
    private static final String SIGNATURE_HEADER = "X-SePay-Signature";
    private static final String TIMESTAMP_HEADER = "X-SePay-Timestamp";

    private final SepayConfig sepayConfig;

    public void verify(HttpServletRequest request, byte[] rawBody) {
        String authMode = normalize(sepayConfig.getWebhookAuthMode()).toUpperCase(Locale.ROOT);
        if (authMode.isBlank()) {
            authMode = HMAC_SHA256;
        }

        switch (authMode) {
            case HMAC_SHA256 -> verifyHmac(request, rawBody);
            case API_KEY -> verifyApiKey(request);
            default -> throw new SepayWebhookVerificationException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "SEPAY_WEBHOOK_AUTH_MODE_INVALID",
                    "SePay webhook auth mode is invalid"
            );
        }
    }

    private void verifyHmac(HttpServletRequest request, byte[] rawBody) {
        String secret = normalize(sepayConfig.getWebhookSecret());
        if (secret.isBlank()) {
            throw new SepayWebhookVerificationException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "SEPAY_WEBHOOK_SECRET_NOT_CONFIGURED",
                    "SePay webhook secret is not configured"
            );
        }

        String signature = normalize(request.getHeader(SIGNATURE_HEADER));
        String timestampHeader = normalize(request.getHeader(TIMESTAMP_HEADER));
        long timestamp = parseTimestamp(timestampHeader);
        long allowedSkewSeconds = Math.max(sepayConfig.getWebhookToleranceSeconds(), 0);
        long now = Instant.now().getEpochSecond();

        if (signature.isBlank() || timestamp == 0 || Math.abs(now - timestamp) > allowedSkewSeconds) {
            throw unauthorized("SEPAY_WEBHOOK_SIGNATURE_EXPIRED");
        }

        String expectedSignature = "sha256=" + hmacSha256Hex(secret, timestampHeader, rawBody);
        if (!constantTimeEquals(expectedSignature, signature)) {
            throw unauthorized("SEPAY_WEBHOOK_SIGNATURE_INVALID");
        }
    }

    private void verifyApiKey(HttpServletRequest request) {
        String apiToken = normalize(sepayConfig.getApiToken());
        if (apiToken.isBlank()) {
            throw new SepayWebhookVerificationException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "SEPAY_API_TOKEN_NOT_CONFIGURED",
                    "SePay API token is not configured"
            );
        }

        String authorization = normalize(request.getHeader(HttpHeaders.AUTHORIZATION));
        String expectedAuthorization = "Apikey " + apiToken;
        if (!constantTimeEquals(expectedAuthorization, authorization)) {
            throw unauthorized("SEPAY_WEBHOOK_API_KEY_INVALID");
        }
    }

    private String hmacSha256Hex(String secret, String timestamp, byte[] rawBody) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));

            ByteArrayOutputStream signedPayload = new ByteArrayOutputStream();
            signedPayload.write(timestamp.getBytes(StandardCharsets.UTF_8));
            signedPayload.write('.');
            signedPayload.write(rawBody);

            return HexFormat.of().formatHex(mac.doFinal(signedPayload.toByteArray()));
        } catch (Exception e) {
            throw new IllegalStateException("Cannot verify SePay webhook signature", e);
        }
    }

    private long parseTimestamp(String timestampHeader) {
        try {
            return Long.parseLong(timestampHeader);
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private boolean constantTimeEquals(String expected, String actual) {
        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                actual.getBytes(StandardCharsets.UTF_8)
        );
    }

    private SepayWebhookVerificationException unauthorized(String code) {
        return new SepayWebhookVerificationException(HttpStatus.UNAUTHORIZED, code, "Unauthorized SePay webhook");
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
