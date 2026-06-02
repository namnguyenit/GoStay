package com.GoTravel.CartandOrder.controller;

import com.GoTravel.CartandOrder.dto.request.BookNowRequest;
import com.GoTravel.CartandOrder.dto.request.CheckoutCartRequest;
import com.GoTravel.CartandOrder.dto.response.ApiResponse;
import com.GoTravel.CartandOrder.dto.response.OrderResponse;
import com.GoTravel.CartandOrder.entity.Order;
import com.GoTravel.CartandOrder.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout-cart")
    public ResponseEntity<ApiResponse<OrderResponse>> checkoutCart(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody @Valid CheckoutCartRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Checkout thành công, đang chuyển đến thanh toán", orderService.checkoutCart(userId, request)));
    }

    @PostMapping("/book-now")
    public ResponseEntity<ApiResponse<OrderResponse>> bookNow(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody @Valid BookNowRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đặt dịch vụ thành công, đang chuyển đến thanh toán", orderService.bookNow(userId, request)));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderDetails(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID orderId) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderDetails(userId, orderId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getUserOrders(
            @RequestHeader("X-User-Id") UUID userId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getUserOrders(userId, pageable)));
    }

    @GetMapping("/host")
    @PreAuthorize("hasRole('HOST') or hasRole('ENTERPRISE') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getHostOrders(
            @RequestHeader("X-User-Id") UUID hostId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getHostOrders(hostId, pageable)));
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID orderId) {
        orderService.cancelOrder(userId, orderId);
        return ResponseEntity.ok(ApiResponse.success("Đã hủy đơn hàng thành công"));
    }

    @GetMapping("/check-purchased/{listingId}")
    public ResponseEntity<ApiResponse<Boolean>> checkPurchased(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID listingId) {
        return ResponseEntity.ok(ApiResponse.success("Success", orderService.hasPurchasedListing(userId, listingId)));
    }
}
