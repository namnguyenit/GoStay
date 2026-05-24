package com.Listing.CatalogandListing.mapper;

import com.Listing.CatalogandListing.dto.request.review.SubmitReviewRequest;
import com.Listing.CatalogandListing.dto.response.ReviewItemResponse;
import com.Listing.CatalogandListing.entity.Review;
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
public class ReviewMapperImpl implements ReviewMapper {

    @Override
    public Review toEntity(SubmitReviewRequest request) {
        if ( request == null ) {
            return null;
        }

        Review.ReviewBuilder review = Review.builder();

        review.rating( request.getRating() );
        review.comment( request.getComment() );
        List<String> list = request.getImages();
        if ( list != null ) {
            review.images( new ArrayList<String>( list ) );
        }

        return review.build();
    }

    @Override
    public ReviewItemResponse toItemResponse(Review entity) {
        if ( entity == null ) {
            return null;
        }

        ReviewItemResponse.ReviewItemResponseBuilder reviewItemResponse = ReviewItemResponse.builder();

        reviewItemResponse.id( entity.getId() );
        reviewItemResponse.userId( entity.getUserId() );
        reviewItemResponse.rating( entity.getRating() );
        reviewItemResponse.comment( entity.getComment() );
        List<String> list = entity.getImages();
        if ( list != null ) {
            reviewItemResponse.images( new ArrayList<String>( list ) );
        }
        reviewItemResponse.createdAt( entity.getCreatedAt() );

        return reviewItemResponse.build();
    }

    @Override
    public void updateEntityFromRequest(SubmitReviewRequest request, Review entity) {
        if ( request == null ) {
            return;
        }

        entity.setRating( request.getRating() );
        entity.setComment( request.getComment() );
        if ( entity.getImages() != null ) {
            List<String> list = request.getImages();
            if ( list != null ) {
                entity.getImages().clear();
                entity.getImages().addAll( list );
            }
            else {
                entity.setImages( null );
            }
        }
        else {
            List<String> list = request.getImages();
            if ( list != null ) {
                entity.setImages( new ArrayList<String>( list ) );
            }
        }
    }
}
