package com.Listing.CatalogandListing.service;

import com.Listing.CatalogandListing.dto.request.landmark.SaveLandmarkRequest;
import com.Listing.CatalogandListing.dto.request.landmark.SuggestLandmarkRequest;
import com.Listing.CatalogandListing.dto.request.landmark.UpdateLandmarkStatusRequest;
import com.Listing.CatalogandListing.dto.request.landmark.UpdateSuggestionStatusRequest;
import com.Listing.CatalogandListing.entity.Landmark;
import com.Listing.CatalogandListing.entity.LandmarkSuggestion;
import com.Listing.CatalogandListing.enums.SuggestionStatus;
import com.Listing.CatalogandListing.dto.response.PaginationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.Listing.CatalogandListing.mapper.LandmarkMapper;
import com.Listing.CatalogandListing.mapper.LandmarkSuggestionMapper;
import com.Listing.CatalogandListing.repository.LandmarkRepository;
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
    final LandmarkMapper landmarkMapper;
    final LandmarkRepository landmarkRepository;

    public PaginationResponse<LandmarkSuggestion> getLandmarkSuggestions(String status, int page, int size) {
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        Page<LandmarkSuggestion> suggestionPage;
        if (status != null && !status.isBlank()) {
            SuggestionStatus enumStatus = SuggestionStatus.valueOf(status.toUpperCase());
            suggestionPage = landmarkSuggestionRepository.findByStatus(enumStatus, pageable);
        } else {
            suggestionPage = landmarkSuggestionRepository.findAll(pageable);
        }

        return PaginationResponse.<LandmarkSuggestion>builder()
                .content(suggestionPage.getContent())
                .totalPages(suggestionPage.getTotalPages())
                .totalElements(suggestionPage.getTotalElements())
                .build();
    }

    /**
     * create request add new landmark.
     * 
     * @param userId                 ID của người dùng từ token (Host)
     * @param suggestLandmarkRequest Dữ liệu gợi ý
     * @return void
     */
    public void suggestLandmark(String userId, SuggestLandmarkRequest suggestLandmarkRequest) {
        LandmarkSuggestion landmarkSuggestion = landmarkSuggestionMapper.toEntity(suggestLandmarkRequest);
        landmarkSuggestion.setHostId(UUID.fromString(userId));
        landmarkSuggestion.setStatus(SuggestionStatus.PENDING);
        landmarkSuggestionRepository.save(landmarkSuggestion);
    }

    public void updateSuggestionStatus(UUID suggestionId, UpdateSuggestionStatusRequest request) {
        LandmarkSuggestion suggestion = landmarkSuggestionRepository.findById(suggestionId)
                .orElseThrow(() -> new com.Listing.CatalogandListing.exception.AppException(
                        com.Listing.CatalogandListing.exception.LandmarkErrorCode.SUGGESTION_NOT_FOUND));

        suggestion.setStatus(request.getStatus());
        if (request.getStatus() == SuggestionStatus.REJECTED) {
            suggestion.setRejectReason(request.getRejectReason());
        }
        landmarkSuggestionRepository.save(suggestion);
    }

    public void createLandmark(SaveLandmarkRequest request) {
        Landmark landmark = landmarkMapper.toEntity(request);
        landmark.setStatus(com.Listing.CatalogandListing.enums.LandmarkStatus.ACTIVE);
        landmarkRepository.save(landmark);

        if (request.getResolvedSuggestionId() != null) {
            landmarkSuggestionRepository.findById(request.getResolvedSuggestionId()).ifPresent(suggestion -> {
                suggestion.setStatus(SuggestionStatus.RESOLVED);
                landmarkSuggestionRepository.save(suggestion);
            });
        }
    }

    public void updateLandmark(UUID landmarkId, SaveLandmarkRequest request) {
        Landmark landmark = landmarkRepository.findById(landmarkId)
                .orElseThrow(() -> new com.Listing.CatalogandListing.exception.AppException(
                        com.Listing.CatalogandListing.exception.LandmarkErrorCode.LANDMARK_NOT_FOUND));

        landmarkMapper.updateEntityFromRequest(request, landmark);
        landmarkRepository.save(landmark);
    }

    public void changeLandmarkStatus(UUID landmarkId, UpdateLandmarkStatusRequest request) {
        Landmark landmark = landmarkRepository.findById(landmarkId)
                .orElseThrow(() -> new com.Listing.CatalogandListing.exception.AppException(
                        com.Listing.CatalogandListing.exception.LandmarkErrorCode.LANDMARK_NOT_FOUND));

        landmark.setStatus(request.getStatus());
        landmarkRepository.save(landmark);
    }
}
