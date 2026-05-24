package com.Listing.CatalogandListing.mapper;

import com.Listing.CatalogandListing.dto.request.complex.CreateComplexRequest;
import com.Listing.CatalogandListing.entity.Complex;
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
public class ComplexMapperImpl implements ComplexMapper {

    @Override
    public Complex toEntity(CreateComplexRequest request) {
        if ( request == null ) {
            return null;
        }

        Complex.ComplexBuilder complex = Complex.builder();

        complex.name( request.getName() );
        complex.description( request.getDescription() );
        complex.province( request.getProvince() );
        complex.latitude( request.getLatitude() );
        complex.longitude( request.getLongitude() );
        complex.thumbnailUrl( request.getThumbnailUrl() );
        List<String> list = request.getGalleryUrls();
        if ( list != null ) {
            complex.galleryUrls( new ArrayList<String>( list ) );
        }

        return complex.build();
    }

    @Override
    public void updateEntityFromRequest(CreateComplexRequest request, Complex entity) {
        if ( request == null ) {
            return;
        }

        entity.setName( request.getName() );
        entity.setDescription( request.getDescription() );
        entity.setProvince( request.getProvince() );
        entity.setLatitude( request.getLatitude() );
        entity.setLongitude( request.getLongitude() );
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
    }
}
