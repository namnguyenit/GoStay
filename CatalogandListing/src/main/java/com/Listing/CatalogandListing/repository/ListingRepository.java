package com.Listing.CatalogandListing.repository;

import com.Listing.CatalogandListing.entity.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {
    List<Listing> findByOwnerUsername(String ownerUsername);
}
