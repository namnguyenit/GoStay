package com.GoTravel.CartandOrder.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchLockRequest {
    private UUID orderId;
    private List<LockItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LockItemRequest {
        private UUID listingId;
        private LocalDate startDate;
        private LocalDate endDate;
        private String timeSlot;
        private Integer quantity;
    }
}
