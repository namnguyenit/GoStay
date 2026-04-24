package com.Listing.CatalogandListing.mapper;

import com.Listing.CatalogandListing.dto.response.ListingResponse;
import com.Listing.CatalogandListing.dto.response.ListingServiceResponse;
import com.Listing.CatalogandListing.entity.Listing;
import com.Listing.CatalogandListing.entity.ListingService;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.stream.Collectors;

@Component
public class ListingMapper {

    public ListingServiceResponse toServiceResponse(ListingService service) {
        if (service == null) return null;
        return ListingServiceResponse.builder()
                .id(service.getId())
                .serviceName(service.getServiceName())
                .price(service.getPrice())
                .build();
    }

    public ListingResponse toResponse(Listing listing) {
        if (listing == null) return null;
        return ListingResponse.builder()
                .id(listing.getId())
                .name(listing.getName())
                .ownerUsername(listing.getOwnerUsername())
                .latitude(listing.getCoordinate() != null ? listing.getCoordinate().getLatitude() : null)
                .longitude(listing.getCoordinate() != null ? listing.getCoordinate().getLongitude() : null)
                .provinceName(listing.getLocation() != null ? listing.getLocation().getProvinceName() : null)
                .services(listing.getServices() != null 
                        ? listing.getServices().stream().map(this::toServiceResponse).collect(Collectors.toList()) 
                        : new ArrayList<>())
                .build();
    }
}
