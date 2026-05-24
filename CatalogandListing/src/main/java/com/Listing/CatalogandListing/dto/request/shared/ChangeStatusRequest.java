package com.Listing.CatalogandListing.dto.request.shared;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangeStatusRequest {
    @NotBlank(message = "Status không được để trống")
    private String status;
    
    private String rejectReason;
}
