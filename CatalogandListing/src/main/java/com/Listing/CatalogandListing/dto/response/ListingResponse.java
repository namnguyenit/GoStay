package com.Listing.CatalogandListing.dto.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ListingResponse {
    private Long id;
    private String name;
    private String ownerUsername;
    private Double latitude;
    private Double longitude;
    private String provinceName;
    private List<ListingServiceResponse> services;
}
