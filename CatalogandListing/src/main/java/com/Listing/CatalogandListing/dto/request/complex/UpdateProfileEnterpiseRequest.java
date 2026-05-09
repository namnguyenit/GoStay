package com.Listing.CatalogandListing.dto.request.complex;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileEnterpiseRequest {
    String name;
    String description;
    String province;
    double latitude;
    double longitude;
    String thumbnailUrl;
    List<String> galleryUrls;
}
