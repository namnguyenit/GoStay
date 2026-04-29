package com.Listing.CatalogandListing.repository;

import com.Listing.CatalogandListing.entity.LandmarkSuggestion;
import com.Listing.CatalogandListing.enums.SuggestionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LandmarkSuggestionRepository extends JpaRepository<LandmarkSuggestion, UUID> {
    List<LandmarkSuggestion> findByHostId(UUID hostId);
    List<LandmarkSuggestion> findByStatus(SuggestionStatus status);
    List<LandmarkSuggestion> findBySuggestedProvince(String province);
}
