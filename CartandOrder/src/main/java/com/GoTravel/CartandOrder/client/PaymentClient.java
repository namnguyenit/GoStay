package com.GoTravel.CartandOrder.client;

import com.GoTravel.CartandOrder.configuration.InternalFeignConfig;
import com.GoTravel.CartandOrder.dto.request.RefundOrderRequest;
import com.GoTravel.CartandOrder.dto.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.UUID;

@FeignClient(name = "payment-wallet", url = "${services.payment.url:http://localhost:8085}", configuration = InternalFeignConfig.class)
public interface PaymentClient {
    @PutMapping("/api/v1/internal/payments/order/{orderId}/refund")
    ApiResponse<Void> refundOrder(@PathVariable("orderId") UUID orderId, @RequestBody RefundOrderRequest request);
}
