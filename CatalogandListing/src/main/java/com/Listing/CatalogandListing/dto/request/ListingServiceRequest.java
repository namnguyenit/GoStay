package com.Listing.CatalogandListing.dto.request;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ListingServiceRequest {
    private Long listingId;
    private String serviceName;
    private Double price;
}
