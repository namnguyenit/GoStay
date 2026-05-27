package com.Listing.CatalogandListing.repository;

import com.Listing.CatalogandListing.entity.Listing;
import com.Listing.CatalogandListing.enums.ListingCategory;
import com.Listing.CatalogandListing.enums.ListingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

@Repository
public interface ListingRepository extends JpaRepository<Listing, UUID> {
    List<Listing> findByHostId(UUID hostId);
    Page<Listing> findByHostId(UUID hostId, Pageable pageable);
    List<Listing> findByComplexId(UUID complexId);
    List<Listing> findByCategory(ListingCategory category);
    List<Listing> findByProvince(String province);
    List<Listing> findByStatus(ListingStatus status);
    Page<Listing> findByStatus(ListingStatus status, Pageable pageable);
    
    Page<Listing> findByStatusAndCategory(ListingStatus status, ListingCategory category, Pageable pageable);
    Page<Listing> findByStatusAndProvince(ListingStatus status, String province, Pageable pageable);
    Page<Listing> findByStatusAndCategoryAndProvince(ListingStatus status, ListingCategory category, String province, Pageable pageable);
}
