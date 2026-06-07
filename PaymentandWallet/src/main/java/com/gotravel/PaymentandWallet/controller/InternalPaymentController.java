package com.gotravel.PaymentandWallet.controller;

import com.gotravel.PaymentandWallet.dto.request.RefundOrderRequest;
import com.gotravel.PaymentandWallet.dto.response.ApiResponse;
import com.gotravel.PaymentandWallet.dto.response.PaymentResponse;
import com.gotravel.PaymentandWallet.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller nội bộ - Cho các Service khác gọi (CartandOrder, v.v.)
 */
@RestController
@RequestMapping("/api/v1/internal/payments")
@RequiredArgsConstructor
public class InternalPaymentController {

    private final PaymentService paymentService;

    @GetMapping("/order/{orderId}/status")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentStatus(@PathVariable UUID orderId) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPaymentStatusByOrderId(orderId)));
    }

    @PutMapping("/order/{orderId}/refund")
    public ResponseEntity<ApiResponse<Void>> refundOrder(
            @PathVariable UUID orderId,
            @RequestBody(required = false) RefundOrderRequest request) {
        paymentService.refundOrder(orderId, request);
        return ResponseEntity.ok(ApiResponse.success("Đã ghi nhận hoàn tiền cho đơn hàng"));
    }
}
