package com.Listing.CatalogandListing.repository;

import com.Listing.CatalogandListing.entity.Landmark;
import com.Listing.CatalogandListing.enums.LandmarkStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LandmarkRepository extends JpaRepository<Landmark, UUID> {
    List<Landmark> findByProvince(String province);
    List<Landmark> findByIsFeaturedTrue();
    List<Landmark> findByStatus(LandmarkStatus status);
    org.springframework.data.domain.Page<Landmark> findByStatus(LandmarkStatus status, org.springframework.data.domain.Pageable pageable);
    long countByStatus(LandmarkStatus status);
    long countByIsFeaturedTrue();

    @Query(value = """
            SELECT lm.*
            FROM public.landmarks lm
            LEFT JOIN public.listings l
              ON l.status = 'ACTIVE'
             AND l.location IS NOT NULL
             AND lm.location IS NOT NULL
             AND ST_DWithin(l.location::geography, lm.location::geography, 5000)
            WHERE lm.status = 'ACTIVE'
            GROUP BY lm.id
            ORDER BY COUNT(l.id) DESC,
                     COALESCE(lm.is_featured, false) DESC,
                     lm.name ASC
            """, nativeQuery = true)
    List<Landmark> findActiveOrderByNearbyListingCount();
}
