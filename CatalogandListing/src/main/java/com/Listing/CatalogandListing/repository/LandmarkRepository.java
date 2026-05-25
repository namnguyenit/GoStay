package com.Listing.CatalogandListing.repository;

import com.Listing.CatalogandListing.entity.Landmark;
import com.Listing.CatalogandListing.enums.LandmarkStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LandmarkRepository extends JpaRepository<Landmark, UUID> {
    List<Landmark> findByProvince(String province);
    List<Landmark> findByIsFeaturedTrue();
    List<Landmark> findByStatus(LandmarkStatus status);
    org.springframework.data.domain.Page<Landmark> findByStatus(LandmarkStatus status, org.springframework.data.domain.Pageable pageable);
}
