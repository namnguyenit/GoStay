package com.Listing.CatalogandListing.listener;

import com.Listing.CatalogandListing.entity.Listing;
import com.Listing.CatalogandListing.event.ReviewSubmittedEvent;
import com.Listing.CatalogandListing.repository.ListingRepository;
import com.Listing.CatalogandListing.repository.ReviewRepository;
import com.Listing.CatalogandListing.enums.ReviewStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReviewEventListener {

    private final ListingRepository listingRepository;
    private final ReviewRepository reviewRepository;

    @Async
    @EventListener
    @Transactional
    public void handleReviewSubmittedEvent(ReviewSubmittedEvent event) {
        try {
            log.info("Bắt đầu cập nhật điểm rating cho Listing: {}", event.getListingId());
            
            Listing listing = listingRepository.findById(event.getListingId())
                    .orElse(null);
                    
            if (listing == null) {
                log.warn("Không tìm thấy Listing {}", event.getListingId());
                return;
            }

            long totalReviews = reviewRepository.countByListingIdAndStatus(listing.getId(), ReviewStatus.ACTIVE);
            BigDecimal averageRating = reviewRepository.getAverageRatingByListingId(listing.getId(), ReviewStatus.ACTIVE);

            // Làm tròn đến 1 chữ số thập phân
            averageRating = averageRating.setScale(1, RoundingMode.HALF_UP);

            listing.setTotalReviews((int) totalReviews);
            listing.setAverageRating(averageRating);

            listingRepository.save(listing);
            log.info("Đã cập nhật thành công Listing: {}. Total Reviews: {}, Average Rating: {}", 
                    listing.getId(), totalReviews, averageRating);
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật rating cho Listing: {}", event.getListingId(), e);
        }
    }
}
