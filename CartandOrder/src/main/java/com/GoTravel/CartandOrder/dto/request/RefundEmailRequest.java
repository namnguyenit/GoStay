package com.GoTravel.CartandOrder.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundEmailRequest {
    private String to;
    private String customerName;
    private UUID orderId;
    private String orderNumber;
    private BigDecimal refundAmount;
    private BigDecimal totalAmount;
    private String currency;
    private String reason;
    private String orderUrl;
    private List<RefundEmailItem> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RefundEmailItem {
        private UUID listingId;
        private String listingTitle;
        private String thumbnailUrl;
        private LocalDate startDate;
        private LocalDate endDate;
        private String timeSlot;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }
}
