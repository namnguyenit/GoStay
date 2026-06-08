package com.GoTravel.CartandOrder.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateOrderDisputeRequest {
    @NotNull(message = "Order ID không được để trống")
    private UUID orderId;

    @NotBlank(message = "Lý do khiếu nại không được để trống")
    private String reason;

    private String description;
}
