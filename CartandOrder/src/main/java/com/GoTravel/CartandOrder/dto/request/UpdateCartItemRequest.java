package com.GoTravel.CartandOrder.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCartItemRequest {
    private LocalDate startDate;
    private LocalDate endDate;
    private String timeSlot;
    private Integer quantity;
}
