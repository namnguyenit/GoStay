package com.Listing.CatalogandListing.dto.request.landmark;

import com.Listing.CatalogandListing.enums.SuggestionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateSuggestionStatusRequest {
    @NotNull(message = "Status cannot be null")
    private SuggestionStatus status;
    private String rejectReason;
}
