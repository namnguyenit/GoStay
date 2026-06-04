package com.gotravel.PaymentandWallet.controller;

import com.gotravel.PaymentandWallet.dto.response.ApiResponse;
import com.gotravel.PaymentandWallet.dto.response.HostPayoutResponse;
import com.gotravel.PaymentandWallet.service.HostPayoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller cho Host (chủ dịch vụ) xem thu nhập.
 */
@RestController
@RequestMapping("/api/v1/payouts")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class HostPayoutController {

    private final HostPayoutService hostPayoutService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Page<HostPayoutResponse>>> getMyPayouts(
            @RequestHeader("X-User-Id") UUID hostId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(hostPayoutService.getPayoutsByHost(hostId, pageable)));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<HostPayoutResponse>>> getAllPayouts(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(hostPayoutService.getAllPayouts(pageable)));
    }

    @PutMapping("/{payoutId}/mark-paid")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> markAsPaid(@PathVariable UUID payoutId) {
        hostPayoutService.markAsPaid(payoutId);
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu đã thanh toán cho Host"));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponse<Void>> requestWithdrawal(@RequestHeader("X-User-Id") UUID hostId) {
        hostPayoutService.requestWithdrawal(hostId);
        return ResponseEntity.ok(ApiResponse.success("Đã gửi yêu cầu rút tiền thành công"));
    }
}
