package com.GoTravel.CartandOrder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminOrderSummaryResponse {
    private long totalOrders;
    private long pendingOrders;
    private long paymentPendingOrders;
    private long confirmedOrders;
    private long completedOrders;
    private long cancelledOrders;
    private BigDecimal totalOrderAmount;
    private BigDecimal confirmedOrderAmount;
    private BigDecimal completedOrderAmount;
    private BigDecimal cancelledOrderAmount;
}
