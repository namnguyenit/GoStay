package com.gotravel.PaymentandWallet.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gotravel.PaymentandWallet.configuration.SepayWebhookVerificationException;
import com.gotravel.PaymentandWallet.configuration.SepayWebhookVerifier;
import com.gotravel.PaymentandWallet.dto.request.SepayWebhookRequest;
import com.gotravel.PaymentandWallet.exeption.AppException;
import com.gotravel.PaymentandWallet.exeption.ErrorCode;
import com.gotravel.PaymentandWallet.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller nhận Webhook từ SePay.
 * SePay sẽ gọi POST đến endpoint này mỗi khi có biến động số dư ngân hàng.
 * Request phải được xác thực bằng HMAC-SHA256 hoặc API Key theo cấu hình SePay.
 * Phải trả về {"success": true} trong vòng 30 giây.
 */
@RestController
@RequestMapping("/api/v1/public/payments")
@RequiredArgsConstructor
@Slf4j
public class SepayWebhookController {

    private final PaymentService paymentService;
    private final SepayWebhookVerifier sepayWebhookVerifier;
    private final ObjectMapper objectMapper;

    @PostMapping(value = "/sepay-webhook", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> handleWebhook(
            @RequestBody byte[] rawBody,
            HttpServletRequest httpRequest
    ) {
        try {
            sepayWebhookVerifier.verify(httpRequest, rawBody);
            SepayWebhookRequest request = objectMapper.readValue(rawBody, SepayWebhookRequest.class);
            log.info("Received SePay webhook: id={}, content={}, amount={}",
                    request.getId(), request.getContent(), request.getTransferAmount());

            paymentService.handleSepayWebhook(request);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (SepayWebhookVerificationException e) {
            log.warn("Rejected SePay webhook: {}", e.getCode());
            return ResponseEntity.status(e.getHttpStatus())
                    .body(Map.of("success", false, "message", e.getCode()));
        } catch (AppException e) {
            ErrorCode errorCode = e.getErrorCode();
            log.warn("Rejected SePay webhook business validation: {}", errorCode.getCode());
            return ResponseEntity.status(errorCode.getHttpStatus())
                    .body(Map.of("success", false, "message", errorCode.getCode()));
        } catch (Exception e) {
            log.error("Error processing SePay webhook", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "INTERNAL_SERVER_ERROR"));
        }
    }
}
