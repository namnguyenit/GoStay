package com.GoTravel.CartandOrder.controller;

import com.GoTravel.CartandOrder.dto.response.ApiResponse;
import com.GoTravel.CartandOrder.dto.response.OrderPaymentSummaryResponse;
import com.GoTravel.CartandOrder.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/internal/orders")
@RequiredArgsConstructor
public class InternalOrderController {

    private final OrderService orderService;

    @GetMapping("/{orderId}/payment-summary")
    public ResponseEntity<ApiResponse<OrderPaymentSummaryResponse>> getPaymentSummary(@PathVariable UUID orderId) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getPaymentSummary(orderId)));
    }

    @PutMapping("/{orderId}/payment-success")
    public ResponseEntity<ApiResponse<Void>> handlePaymentSuccess(@PathVariable UUID orderId) {
        orderService.confirmPayment(orderId);
        return ResponseEntity.ok(ApiResponse.success("Đã ghi nhận thanh toán thành công"));
    }

    @PutMapping("/{orderId}/payment-failed")
    public ResponseEntity<ApiResponse<Void>> handlePaymentFailed(@PathVariable UUID orderId) {
        orderService.failPayment(orderId);
        return ResponseEntity.ok(ApiResponse.success("Đã ghi nhận thanh toán thất bại"));
    }
}
