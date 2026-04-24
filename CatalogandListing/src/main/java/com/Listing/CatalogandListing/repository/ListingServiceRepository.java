package com.Listing.CatalogandListing.repository;

import com.Listing.CatalogandListing.entity.ListingService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ListingServiceRepository extends JpaRepository<ListingService, Long> {
    long countByListingId(Long listingId);
}
