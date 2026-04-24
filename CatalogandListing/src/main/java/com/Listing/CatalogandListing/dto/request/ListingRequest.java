package com.Listing.CatalogandListing.dto.request;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ListingRequest {
    private String name;
    private Double latitude;
    private Double longitude;
    private String provinceName;
}
