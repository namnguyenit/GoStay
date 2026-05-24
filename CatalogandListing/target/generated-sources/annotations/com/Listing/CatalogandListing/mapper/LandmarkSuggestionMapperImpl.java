package com.Listing.CatalogandListing.mapper;

import com.Listing.CatalogandListing.dto.request.landmark.SuggestLandmarkRequest;
import com.Listing.CatalogandListing.entity.LandmarkSuggestion;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-18T15:25:05+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 23.0.1 (Oracle Corporation)"
)
@Component
public class LandmarkSuggestionMapperImpl implements LandmarkSuggestionMapper {

    @Override
    public LandmarkSuggestion toEntity(SuggestLandmarkRequest request) {
        if ( request == null ) {
            return null;
        }

        LandmarkSuggestion.LandmarkSuggestionBuilder landmarkSuggestion = LandmarkSuggestion.builder();

        landmarkSuggestion.name( request.getName() );
        landmarkSuggestion.description( request.getDescription() );
        landmarkSuggestion.suggestedProvince( request.getSuggestedProvince() );
        landmarkSuggestion.suggestedLatitude( request.getSuggestedLatitude() );
        landmarkSuggestion.suggestedLongitude( request.getSuggestedLongitude() );
        landmarkSuggestion.referenceImageUrl( request.getReferenceImageUrl() );

        return landmarkSuggestion.build();
    }

    @Override
    public void updateEntityFromRequest(SuggestLandmarkRequest request, LandmarkSuggestion entity) {
        if ( request == null ) {
            return;
        }

        entity.setName( request.getName() );
        entity.setDescription( request.getDescription() );
        entity.setSuggestedProvince( request.getSuggestedProvince() );
        entity.setSuggestedLatitude( request.getSuggestedLatitude() );
        entity.setSuggestedLongitude( request.getSuggestedLongitude() );
        entity.setReferenceImageUrl( request.getReferenceImageUrl() );
    }
}
