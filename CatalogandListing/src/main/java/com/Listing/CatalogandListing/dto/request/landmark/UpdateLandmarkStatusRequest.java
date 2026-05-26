package com.Listing.CatalogandListing.dto.request.landmark;

import com.Listing.CatalogandListing.enums.LandmarkStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateLandmarkStatusRequest {
    @NotNull(message = "Status cannot be null")
    private LandmarkStatus status;
}
