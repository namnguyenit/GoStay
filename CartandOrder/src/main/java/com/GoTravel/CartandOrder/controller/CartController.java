package com.GoTravel.CartandOrder.controller;

import com.GoTravel.CartandOrder.dto.request.CartItemRequest;
import com.GoTravel.CartandOrder.dto.request.UpdateCartItemRequest;
import com.GoTravel.CartandOrder.dto.response.ApiResponse;
import com.GoTravel.CartandOrder.dto.response.CartResponse;
import com.GoTravel.CartandOrder.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/carts")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(cartService.getCart(userId)));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItemToCart(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody @Valid CartItemRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Thêm vào giỏ hàng thành công", cartService.addItemToCart(userId, request)));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<Void>> removeItemFromCart(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID itemId) {
        cartService.removeItemFromCart(userId, itemId);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa sản phẩm khỏi giỏ hàng"));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID itemId,
            @RequestBody @Valid UpdateCartItemRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật giỏ hàng", cartService.updateCartItem(userId, itemId, request)));
    }
}
