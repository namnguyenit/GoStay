package com.Listing.CatalogandListing.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ListingServiceResponse {
    private Long id;
    private String serviceName;
    private Double price;
}
