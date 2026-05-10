package com.Listing.CatalogandListing.dto.request.review;

import com.Listing.CatalogandListing.enums.ReviewStatus;
import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class ModerateReviewRequest {
    @NotNull(message = "Status cannot be null")
    private ReviewStatus status;
    private String reason;
}
