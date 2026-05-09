package com.Listing.CatalogandListing.service;

import com.Listing.CatalogandListing.dto.request.review.SubmitReviewRequest;
import com.Listing.CatalogandListing.dto.response.PaginationResponse;
import com.Listing.CatalogandListing.dto.response.ReviewItemResponse;
import com.Listing.CatalogandListing.entity.Listing;
import com.Listing.CatalogandListing.entity.Review;
import com.Listing.CatalogandListing.exception.ListingErrorCode;
import com.Listing.CatalogandListing.exception.ReviewErrorCode;
import com.Listing.CatalogandListing.repository.ListingRepository;
import com.Listing.CatalogandListing.repository.ReviewRepository;
import com.Listing.CatalogandListing.event.ReviewSubmittedEvent;
import org.springframework.context.ApplicationEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ListingRepository listingRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void submitReview(String userIdStr, SubmitReviewRequest request) {
        UUID userId = UUID.fromString(userIdStr);
        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new RuntimeException(ListingErrorCode.LISTING_NOT_FOUND.getMessage()));

        // Check if user already reviewed (optional based on business logic, assuming yes for now)
        if (reviewRepository.existsByListingIdAndUserId(listing.getId(), userId)) {
            throw new RuntimeException(ReviewErrorCode.USER_ALREADY_REVIEWED.getMessage());
        }

        Review review = Review.builder()
                .listing(listing)
                .userId(userId)
                .rating(request.getRating())
                .comment(request.getComment())
                .images(request.getImages())
                .build();

        reviewRepository.save(review);
        
        // Bắn event ra ngoài để xử lý ngầm (update rating)
        eventPublisher.publishEvent(new ReviewSubmittedEvent(this, listing.getId()));
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
}
