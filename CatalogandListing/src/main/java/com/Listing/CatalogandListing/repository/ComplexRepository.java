package com.Listing.CatalogandListing.repository;

import com.Listing.CatalogandListing.entity.Complex;
import com.Listing.CatalogandListing.enums.ComplexStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ComplexRepository extends JpaRepository<Complex, UUID> {
    List<Complex> findByHostId(UUID hostId);
    List<Complex> findByProvince(String province);
    List<Complex> findByStatus(ComplexStatus status);
}
