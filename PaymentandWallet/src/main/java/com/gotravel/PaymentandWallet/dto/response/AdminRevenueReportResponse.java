package com.gotravel.PaymentandWallet.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminRevenueReportResponse {
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalAmount;
    private BigDecimal hostAmount;
    private BigDecimal commissionAmount;
    private long payoutCount;
    private List<DailyRevenue> daily;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyRevenue {
        private LocalDate date;
        private BigDecimal totalAmount;
        private BigDecimal hostAmount;
        private BigDecimal commissionAmount;
        private long payoutCount;
    }
}
