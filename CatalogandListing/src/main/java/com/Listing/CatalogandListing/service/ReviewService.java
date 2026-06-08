package com.Listing.CatalogandListing.service;

import com.Listing.CatalogandListing.client.OrderClient;
import com.Listing.CatalogandListing.dto.request.review.SubmitReviewRequest;
import com.Listing.CatalogandListing.dto.response.OrderCompletionResponse;
import com.Listing.CatalogandListing.dto.response.PaginationResponse;
import com.Listing.CatalogandListing.dto.response.ReviewItemResponse;
import com.Listing.CatalogandListing.entity.Listing;
import com.Listing.CatalogandListing.entity.Review;
import com.Listing.CatalogandListing.exception.AppException;
import com.Listing.CatalogandListing.exception.ListingErrorCode;
import com.Listing.CatalogandListing.exception.ReviewErrorCode;
import com.Listing.CatalogandListing.repository.ListingRepository;
import com.Listing.CatalogandListing.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ListingRepository listingRepository;
    private final OrderClient orderClient;

    @Transactional
    public void submitReview(String userIdStr, SubmitReviewRequest request) {
        UUID userId = UUID.fromString(userIdStr);
        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new AppException(ListingErrorCode.LISTING_NOT_FOUND));

        if (reviewRepository.existsByListingIdAndUserId(listing.getId(), userId)) {
            throw new AppException(ReviewErrorCode.USER_ALREADY_REVIEWED);
        }

        ensureCompletedOrder(userId, listing.getId());

        Review review = Review.builder()
                .listing(listing)
                .userId(userId)
                .rating(request.getRating())
                .comment(request.getComment())
                .images(request.getImages())
                .build();
        reviewRepository.save(review);

        // Cập nhật rating tổng của Listing
        Double avgRating = reviewRepository.getAverageRatingByListingId(listing.getId());
        Integer totalReviews = reviewRepository.countByListingId(listing.getId());
        listing.setAverageRating(avgRating == null ? BigDecimal.ZERO : BigDecimal.valueOf(avgRating));
        listing.setTotalReviews(totalReviews);
        listingRepository.save(listing);
    }

    @Transactional(readOnly = true)
    public PaginationResponse<ReviewItemResponse> getListingReviews(UUID listingId, int page, int size) {
        // Check if listing exists
        if (!listingRepository.existsById(listingId)) {
            throw new RuntimeException(ListingErrorCode.LISTING_NOT_FOUND.getMessage());
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Review> reviewPage = reviewRepository.findByListingId(listingId, pageable);

        List<ReviewItemResponse> items = reviewPage.getContent().stream()
                .map(review -> ReviewItemResponse.builder()
                        .id(review.getId())
                        .userId(review.getUserId())
                        .userName("User " + review.getUserId().toString().substring(0, 8)) // Placeholder
                        .userAvatar(null) // Placeholder
                        .rating(review.getRating())
                        .comment(review.getComment())
                        .images(review.getImages())
                        .createdAt(review.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return PaginationResponse.<ReviewItemResponse>builder()
                .content(items)
                .totalElements(reviewPage.getTotalElements())
                .totalPages(reviewPage.getTotalPages())
                .build();
    }

    private void ensureCompletedOrder(UUID userId, UUID listingId) {
        try {
            OrderCompletionResponse response = orderClient.hasCompletedListingOrder(userId, listingId);
            if (response != null && Boolean.TRUE.equals(response.getData())) {
                return;
            }

            throw new AppException(ReviewErrorCode.ORDER_NOT_COMPLETED);
        } catch (AppException exception) {
            throw exception;
        } catch (Exception exception) {
            log.warn("Cannot verify completed order before review. userId={}, listingId={}", userId, listingId, exception);
            throw new AppException(ReviewErrorCode.ORDER_SERVICE_UNAVAILABLE);
        }
    }
}
