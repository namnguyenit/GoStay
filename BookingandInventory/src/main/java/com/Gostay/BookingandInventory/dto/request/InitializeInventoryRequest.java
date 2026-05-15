package com.Gostay.BookingandInventory.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InitializeInventoryRequest {
    private UUID listingId;
    private String category;
    private int quantity;
    private List<String> timeSlots;
}
