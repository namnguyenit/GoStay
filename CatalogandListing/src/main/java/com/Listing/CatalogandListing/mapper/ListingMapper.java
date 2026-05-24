package com.Listing.CatalogandListing.mapper;

import com.Listing.CatalogandListing.dto.request.listing.SaveListingRequest;
import com.Listing.CatalogandListing.dto.response.ListingDetailResponse;
import com.Listing.CatalogandListing.entity.Listing;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ListingMapper {
    Listing toEntity(SaveListingRequest request);
    ListingDetailResponse toDetailResponse(Listing entity);
    void updateEntityFromRequest(SaveListingRequest request, @MappingTarget Listing entity);
}
