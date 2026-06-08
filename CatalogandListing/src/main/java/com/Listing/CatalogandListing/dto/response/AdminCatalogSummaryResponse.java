package com.Listing.CatalogandListing.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCatalogSummaryResponse {
    private long totalListings;
    private long activeListings;
    private long pendingListings;
    private long hiddenListings;
    private long deletedListings;
    private long totalLandmarks;
    private long activeLandmarks;
    private long hiddenLandmarks;
    private long maintenanceLandmarks;
    private long featuredLandmarks;
    private long totalLandmarkSuggestions;
    private long pendingLandmarkSuggestions;
    private long resolvedLandmarkSuggestions;
    private long rejectedLandmarkSuggestions;
}
