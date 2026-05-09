package com.Listing.CatalogandListing.dto.response;

import com.Listing.CatalogandListing.enums.SuggestionStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LandmarkSuggestionResponse {
    UUID id;
    UUID hostId;
    String name;
    String description;
    String suggestedProvince;
    Double suggestedLatitude;
    Double suggestedLongitude;
    String referenceImageUrl;
    SuggestionStatus status;
    String rejectReason;
    LocalDateTime createdAt;
}
