package com.Listing.CatalogandListing.repository;

import com.Listing.CatalogandListing.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.Listing.CatalogandListing.enums.ReviewStatus;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByListingId(UUID listingId);
    Page<Review> findByListingId(UUID listingId, Pageable pageable);
    Page<Review> findByListingIdAndStatus(UUID listingId, ReviewStatus status, Pageable pageable);
    List<Review> findByUserId(UUID userId);
    boolean existsByListingIdAndUserId(UUID listingId, UUID userId);
    
    long countByListingId(UUID listingId);
    long countByListingIdAndStatus(UUID listingId, ReviewStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.listing.id = :listingId AND r.status = :status")
    java.math.BigDecimal getAverageRatingByListingId(@org.springframework.data.repository.query.Param("listingId") UUID listingId, @org.springframework.data.repository.query.Param("status") ReviewStatus status);
}
