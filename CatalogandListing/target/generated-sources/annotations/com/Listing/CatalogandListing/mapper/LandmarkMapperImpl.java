package com.Listing.CatalogandListing.mapper;

import com.Listing.CatalogandListing.dto.request.landmark.SaveLandmarkRequest;
import com.Listing.CatalogandListing.entity.Landmark;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-18T15:25:05+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 23.0.1 (Oracle Corporation)"
)
@Component
public class LandmarkMapperImpl implements LandmarkMapper {

    @Override
    public Landmark toEntity(SaveLandmarkRequest request) {
        if ( request == null ) {
            return null;
        }

        Landmark.LandmarkBuilder landmark = Landmark.builder();

        landmark.name( request.getName() );
        landmark.description( request.getDescription() );
        landmark.province( request.getProvince() );
        landmark.latitude( request.getLatitude() );
        landmark.longitude( request.getLongitude() );
        landmark.radiusMeters( request.getRadiusMeters() );
        landmark.thumbnailUrl( request.getThumbnailUrl() );
        List<String> list = request.getGalleryUrls();
        if ( list != null ) {
            landmark.galleryUrls( new ArrayList<String>( list ) );
        }
        landmark.isFeatured( request.getIsFeatured() );

        return landmark.build();
    }

    @Override
    public void updateEntityFromRequest(SaveLandmarkRequest request, Landmark entity) {
        if ( request == null ) {
            return;
        }

        entity.setName( request.getName() );
        entity.setDescription( request.getDescription() );
        entity.setProvince( request.getProvince() );
        entity.setLatitude( request.getLatitude() );
        entity.setLongitude( request.getLongitude() );
        entity.setRadiusMeters( request.getRadiusMeters() );
        entity.setThumbnailUrl( request.getThumbnailUrl() );
        if ( entity.getGalleryUrls() != null ) {
            List<String> list = request.getGalleryUrls();
            if ( list != null ) {
                entity.getGalleryUrls().clear();
                entity.getGalleryUrls().addAll( list );
            }
            else {
                entity.setGalleryUrls( null );
            }
        }
        else {
            List<String> list = request.getGalleryUrls();
            if ( list != null ) {
                entity.setGalleryUrls( new ArrayList<String>( list ) );
            }
        }
        entity.setIsFeatured( request.getIsFeatured() );
    }
}
