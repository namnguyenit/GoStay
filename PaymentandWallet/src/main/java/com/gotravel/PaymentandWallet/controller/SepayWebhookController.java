package com.gotravel.PaymentandWallet.controller;

import com.gotravel.PaymentandWallet.dto.request.SepayWebhookRequest;
import com.gotravel.PaymentandWallet.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller nhận Webhook từ SePay - Public, KHÔNG cần Token.
 * SePay sẽ gọi POST đến endpoint này mỗi khi có biến động số dư ngân hàng.
 * Phải trả về {"success": true} trong vòng 30 giây.
 */
@RestController
@RequestMapping("/api/v1/public/payments")
@RequiredArgsConstructor
@Slf4j
public class SepayWebhookController {

    private final PaymentService paymentService;

    @PostMapping("/sepay-webhook")
    public ResponseEntity<Map<String, Boolean>> handleWebhook(@RequestBody SepayWebhookRequest request) {
        log.info("Received SePay webhook: id={}, content={}, amount={}", request.getId(), request.getContent(), request.getTransferAmount());

        try {
            paymentService.handleSepayWebhook(request);
        } catch (Exception e) {
            log.error("Error processing webhook: {}", e.getMessage());
        }

        return ResponseEntity.ok(Map.of("success", true));
    }
}
