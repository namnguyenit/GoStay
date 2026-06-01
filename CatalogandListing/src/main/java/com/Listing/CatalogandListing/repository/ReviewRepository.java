package com.Listing.CatalogandListing.repository;

import com.Listing.CatalogandListing.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByListingId(UUID listingId);
    Page<Review> findByListingId(UUID listingId, Pageable pageable);
    List<Review> findByUserId(UUID userId);
    boolean existsByListingIdAndUserId(UUID listingId, UUID userId);

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.listing.id = :listingId")
    Double getAverageRatingByListingId(@Param("listingId") UUID listingId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.listing.id = :listingId")
    Integer countByListingId(@Param("listingId") UUID listingId);
}
