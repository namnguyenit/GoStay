package com.Listing.CatalogandListing.repository;

import com.Listing.CatalogandListing.entity.Listing;
import com.Listing.CatalogandListing.enums.ListingCategory;
import com.Listing.CatalogandListing.enums.ListingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ListingRepository extends JpaRepository<Listing, UUID> {
    List<Listing> findByHostId(UUID hostId);
    List<Listing> findByComplexId(UUID complexId);
    List<Listing> findByCategory(ListingCategory category);
    List<Listing> findByProvince(String province);
    List<Listing> findByStatus(ListingStatus status);
}
