package com.Listing.CatalogandListing.service;

import com.Listing.CatalogandListing.client.OrderClient;
import com.Listing.CatalogandListing.dto.request.review.SubmitReviewRequest;
import com.Listing.CatalogandListing.dto.response.OrderCompletionResponse;
import com.Listing.CatalogandListing.entity.Listing;
import com.Listing.CatalogandListing.entity.Review;
import com.Listing.CatalogandListing.exception.AppException;
import com.Listing.CatalogandListing.exception.ReviewErrorCode;
import com.Listing.CatalogandListing.repository.ListingRepository;
import com.Listing.CatalogandListing.repository.ReviewRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    ReviewRepository reviewRepository;

    @Mock
    ListingRepository listingRepository;

    @Mock
    OrderClient orderClient;

    @Test
    void submitReviewRequiresCompletedOrder() {
        UUID userId = UUID.randomUUID();
        UUID listingId = UUID.randomUUID();
        Listing listing = Listing.builder()
                .id(listingId)
                .averageRating(BigDecimal.ZERO)
                .totalReviews(0)
                .build();
        SubmitReviewRequest request = SubmitReviewRequest.builder()
                .listingId(listingId)
                .rating(5)
                .comment("Good service")
                .build();

        when(listingRepository.findById(listingId)).thenReturn(Optional.of(listing));
        when(reviewRepository.existsByListingIdAndUserId(listingId, userId)).thenReturn(false);
        when(orderClient.hasCompletedListingOrder(userId, listingId))
                .thenReturn(OrderCompletionResponse.builder()
                        .success(true)
                        .status(200)
                        .code("SUCCESS")
                        .data(false)
                        .build());

        ReviewService service = new ReviewService(reviewRepository, listingRepository, orderClient);

        assertThatThrownBy(() -> service.submitReview(userId.toString(), request))
                .isInstanceOf(AppException.class)
                .extracting(exception -> ((AppException) exception).getErrorCode())
                .isEqualTo(ReviewErrorCode.ORDER_NOT_COMPLETED);
        verify(reviewRepository, never()).save(any(Review.class));
    }

    @Test
    void submitReviewSavesReviewWhenOrderIsCompleted() {
        UUID userId = UUID.randomUUID();
        UUID listingId = UUID.randomUUID();
        Listing listing = Listing.builder()
                .id(listingId)
                .averageRating(BigDecimal.ZERO)
                .totalReviews(0)
                .build();
        SubmitReviewRequest request = SubmitReviewRequest.builder()
                .listingId(listingId)
                .rating(4)
                .comment("Nice stay")
                .build();

        when(listingRepository.findById(listingId)).thenReturn(Optional.of(listing));
        when(reviewRepository.existsByListingIdAndUserId(listingId, userId)).thenReturn(false);
        when(orderClient.hasCompletedListingOrder(userId, listingId))
                .thenReturn(OrderCompletionResponse.builder()
                        .success(true)
                        .status(200)
                        .code("SUCCESS")
                        .data(true)
                        .build());
        when(reviewRepository.getAverageRatingByListingId(listingId)).thenReturn(4.0);
        when(reviewRepository.countByListingId(listingId)).thenReturn(1);

        ReviewService service = new ReviewService(reviewRepository, listingRepository, orderClient);

        service.submitReview(userId.toString(), request);

        ArgumentCaptor<Review> reviewCaptor = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository).save(reviewCaptor.capture());
        assertThat(reviewCaptor.getValue().getListing()).isEqualTo(listing);
        assertThat(reviewCaptor.getValue().getUserId()).isEqualTo(userId);
        assertThat(reviewCaptor.getValue().getRating()).isEqualTo(4);
        assertThat(listing.getAverageRating()).isEqualByComparingTo("4.0");
        assertThat(listing.getTotalReviews()).isEqualTo(1);
    }
}
