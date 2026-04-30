package com.Listing.CatalogandListing.service;


import com.Listing.CatalogandListing.dto.request.landmark.SuggestLandmarkRequest;
import com.Listing.CatalogandListing.dto.response.ApiResponse;
import com.Listing.CatalogandListing.entity.LandmarkSuggestion;
import com.Listing.CatalogandListing.enums.SuggestionStatus;
import com.Listing.CatalogandListing.mapper.LandmarkSuggestionMapper;
import com.Listing.CatalogandListing.repository.LandmarkSuggestionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class LandmarkService {

    final LandmarkSuggestionMapper landmarkSuggestionMapper;
    final LandmarkSuggestionRepository landmarkSuggestionRepository;

    /**
     * create request add new landmark.
     * @param userId ID của người dùng từ token (Host)
     * @param suggestLandmarkRequest Dữ liệu gợi ý
     * @return void
     */
    public void suggestLandmark(String userId, SuggestLandmarkRequest suggestLandmarkRequest){
        LandmarkSuggestion landmarkSuggestion = landmarkSuggestionMapper.toEntity(suggestLandmarkRequest);
        landmarkSuggestion.setHostId(UUID.fromString(userId));
        landmarkSuggestion.setStatus(SuggestionStatus.PENDING);
        landmarkSuggestionRepository.save(landmarkSuggestion);
    }
}
