package com.Listing.CatalogandListing.mapper;

import com.Listing.CatalogandListing.dto.request.landmark.SuggestLandmarkRequest;
import com.Listing.CatalogandListing.entity.LandmarkSuggestion;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface LandmarkSuggestionMapper {
    LandmarkSuggestion toEntity(SuggestLandmarkRequest request);
    void updateEntityFromRequest(SuggestLandmarkRequest request, @MappingTarget LandmarkSuggestion entity);
}