package com.Listing.CatalogandListing.repository;

import com.Listing.CatalogandListing.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    Optional<Location> findByProvinceName(String provinceName);
}
