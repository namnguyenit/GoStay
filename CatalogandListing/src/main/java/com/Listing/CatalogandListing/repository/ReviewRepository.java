package com.Listing.CatalogandListing.repository;

import com.Listing.CatalogandListing.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByListingId(UUID listingId);
    Page<Review> findByListingId(UUID listingId, Pageable pageable);
    List<Review> findByUserId(UUID userId);
    boolean existsByListingIdAndUserId(UUID listingId, UUID userId);
    
    long countByListingId(UUID listingId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.listing.id = :listingId")
    java.math.BigDecimal getAverageRatingByListingId(@org.springframework.data.repository.query.Param("listingId") UUID listingId);
}
