package com.Listing.CatalogandListing.mapper;

import com.Listing.CatalogandListing.dto.request.landmark.SaveLandmarkRequest;
import com.Listing.CatalogandListing.entity.Landmark;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface LandmarkMapper {
    Landmark toEntity(SaveLandmarkRequest request);
    void updateEntityFromRequest(SaveLandmarkRequest request, @MappingTarget Landmark entity);
}
