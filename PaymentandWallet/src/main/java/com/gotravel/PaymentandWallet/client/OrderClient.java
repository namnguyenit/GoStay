package com.gotravel.PaymentandWallet.client;

import com.gotravel.PaymentandWallet.dto.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.UUID;

@FeignClient(name = "cart-order", url = "http://localhost:8084")
public interface OrderClient {

    @PutMapping("/api/v1/internal/orders/{orderId}/payment-success")
    ApiResponse<Void> notifyPaymentSuccess(@PathVariable("orderId") UUID orderId);

    @PutMapping("/api/v1/internal/orders/{orderId}/payment-failed")
    ApiResponse<Void> notifyPaymentFailed(@PathVariable("orderId") UUID orderId);
}
