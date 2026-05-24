package com.Listing.CatalogandListing.mapper;

import com.Listing.CatalogandListing.dto.request.listing.SaveListingRequest;
import com.Listing.CatalogandListing.dto.response.ListingDetailResponse;
import com.Listing.CatalogandListing.entity.Listing;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-18T15:25:05+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 23.0.1 (Oracle Corporation)"
)
@Component
public class ListingMapperImpl implements ListingMapper {

    @Override
    public Listing toEntity(SaveListingRequest request) {
        if ( request == null ) {
            return null;
        }

        Listing.ListingBuilder listing = Listing.builder();

        listing.category( request.getCategory() );
        listing.subCategory( request.getSubCategory() );
        listing.title( request.getTitle() );
        listing.description( request.getDescription() );
        listing.province( request.getProvince() );
        listing.basePrice( request.getBasePrice() );
        listing.priceUnit( request.getPriceUnit() );
        listing.latitude( request.getLatitude() );
        listing.longitude( request.getLongitude() );
        listing.thumbnailUrl( request.getThumbnailUrl() );
        listing.attributes( request.getAttributes() );

        return listing.build();
    }

    @Override
    public ListingDetailResponse toDetailResponse(Listing entity) {
        if ( entity == null ) {
            return null;
        }

        ListingDetailResponse.ListingDetailResponseBuilder listingDetailResponse = ListingDetailResponse.builder();

        listingDetailResponse.id( entity.getId() );
        listingDetailResponse.hostId( entity.getHostId() );
        listingDetailResponse.title( entity.getTitle() );
        listingDetailResponse.description( entity.getDescription() );
        listingDetailResponse.province( entity.getProvince() );
        listingDetailResponse.category( entity.getCategory() );
        listingDetailResponse.subCategory( entity.getSubCategory() );
        listingDetailResponse.basePrice( entity.getBasePrice() );
        listingDetailResponse.priceUnit( entity.getPriceUnit() );
        listingDetailResponse.latitude( entity.getLatitude() );
        listingDetailResponse.longitude( entity.getLongitude() );
        listingDetailResponse.thumbnailUrl( entity.getThumbnailUrl() );
        listingDetailResponse.averageRating( entity.getAverageRating() );
        listingDetailResponse.totalReviews( entity.getTotalReviews() );
        listingDetailResponse.status( entity.getStatus() );
        listingDetailResponse.attributes( entity.getAttributes() );

        return listingDetailResponse.build();
    }

    @Override
    public void updateEntityFromRequest(SaveListingRequest request, Listing entity) {
        if ( request == null ) {
            return;
        }

        entity.setCategory( request.getCategory() );
        entity.setSubCategory( request.getSubCategory() );
        entity.setTitle( request.getTitle() );
        entity.setDescription( request.getDescription() );
        entity.setProvince( request.getProvince() );
        entity.setBasePrice( request.getBasePrice() );
        entity.setPriceUnit( request.getPriceUnit() );
        entity.setLatitude( request.getLatitude() );
        entity.setLongitude( request.getLongitude() );
        entity.setThumbnailUrl( request.getThumbnailUrl() );
        entity.setAttributes( request.getAttributes() );
    }
}
