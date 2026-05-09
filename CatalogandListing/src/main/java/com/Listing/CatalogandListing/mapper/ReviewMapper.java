package com.Listing.CatalogandListing.mapper;

import com.Listing.CatalogandListing.dto.request.review.SubmitReviewRequest;
import com.Listing.CatalogandListing.dto.response.ReviewItemResponse;
import com.Listing.CatalogandListing.entity.Review;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ReviewMapper {
    Review toEntity(SubmitReviewRequest request);
    ReviewItemResponse toItemResponse(Review entity);
    void updateEntityFromRequest(SubmitReviewRequest request, @MappingTarget Review entity);
}
