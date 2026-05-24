package com.Listing.CatalogandListing.mapper;

import com.Listing.CatalogandListing.dto.request.complex.CreateComplexRequest;
import com.Listing.CatalogandListing.entity.Complex;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ComplexMapper {
    Complex toEntity(CreateComplexRequest request);
    void updateEntityFromRequest(CreateComplexRequest request, @MappingTarget Complex entity);
}
