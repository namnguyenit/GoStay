package com.gotravel.PaymentandWallet.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPaymentSummaryResponse {
    private long totalPaymentRequests;
    private long pendingPayments;
    private long completedPayments;
    private long failedPayments;
    private long expiredPayments;
    private BigDecimal totalRequestedAmount;
    private BigDecimal completedPaymentAmount;
    private BigDecimal totalTransactionAmount;
    private long totalPayouts;
    private long pendingPayouts;
    private long requestedPayouts;
    private long paidPayouts;
    private long cancelledPayouts;
    private BigDecimal totalPayoutAmount;
    private BigDecimal totalHostAmount;
    private BigDecimal totalCommissionAmount;
    private BigDecimal pendingHostAmount;
    private BigDecimal requestedHostAmount;
    private BigDecimal paidHostAmount;
    private BigDecimal paidCommissionAmount;
}
