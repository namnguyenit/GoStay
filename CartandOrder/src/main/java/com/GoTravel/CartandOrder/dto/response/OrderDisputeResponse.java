package com.GoTravel.CartandOrder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDisputeResponse {
    private UUID disputeId;
    private UUID orderId;
    private UUID userId;
    private String orderNumber;
    private String orderStatus;
    private BigDecimal orderAmount;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String reason;
    private String description;
    private String status;
    private String adminNote;
    private UUID resolvedBy;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
