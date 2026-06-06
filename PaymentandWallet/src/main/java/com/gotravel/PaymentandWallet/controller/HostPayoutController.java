package com.gotravel.PaymentandWallet.controller;

import com.gotravel.PaymentandWallet.dto.response.ApiResponse;
import com.gotravel.PaymentandWallet.dto.response.AdminPaymentSummaryResponse;
import com.gotravel.PaymentandWallet.dto.response.AdminRevenueReportResponse;
import com.gotravel.PaymentandWallet.dto.response.HostPayoutResponse;
import com.gotravel.PaymentandWallet.service.HostPayoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.time.LocalDate;

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

    @GetMapping("/admin/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminPaymentSummaryResponse>> getAdminSummary() {
        return ResponseEntity.ok(ApiResponse.success("Lấy thống kê thanh toán thành công", hostPayoutService.getAdminSummary()));
    }

    @GetMapping("/admin/revenue-report")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminRevenueReportResponse>> getRevenueReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success("Lấy báo cáo doanh thu thành công", hostPayoutService.getRevenueReport(startDate, endDate)));
    }

    @PutMapping("/{payoutId}/mark-paid")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> markAsPaid(@PathVariable UUID payoutId) {
        hostPayoutService.markAsPaid(payoutId);
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu đã thanh toán cho Host"));
    }

    @PutMapping("/host/{hostId}/mark-paid")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> markAllAsPaidByHost(@PathVariable UUID hostId) {
        hostPayoutService.markAllAsPaidByHost(hostId);
        return ResponseEntity.ok(ApiResponse.success("Đã thanh toán toàn bộ cho Host"));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponse<Void>> requestWithdrawal(@RequestHeader("X-User-Id") UUID hostId) {
        hostPayoutService.requestWithdrawal(hostId);
        return ResponseEntity.ok(ApiResponse.success("Đã gửi yêu cầu rút tiền thành công"));
    }
}
