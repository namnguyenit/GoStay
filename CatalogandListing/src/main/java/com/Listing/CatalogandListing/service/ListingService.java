package com.Listing.CatalogandListing.service;

import com.Listing.CatalogandListing.dto.request.listing.SaveListingRequest;
import com.Listing.CatalogandListing.entity.Listing;
import com.Listing.CatalogandListing.enums.ListingStatus;
import com.Listing.CatalogandListing.exception.AppException;
import com.Listing.CatalogandListing.exception.ListingErrorCode;
import com.Listing.CatalogandListing.mapper.ListingMapper;
import com.Listing.CatalogandListing.repository.ListingRepository;
import com.Listing.CatalogandListing.dto.response.PaginationResponse;
import com.Listing.CatalogandListing.dto.response.ListingDetailResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ListingService {

    ListingMapper listingMapper;
    ListingRepository listingRepository;

    public PaginationResponse<ListingDetailResponse> getListingsByHost(String userId, String complexId, int page, int size) {
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        Page<Listing> listingPage;
        
        if (complexId != null && !complexId.isBlank()) {
            listingPage = listingRepository.findByHostIdAndComplexId(UUID.fromString(userId), UUID.fromString(complexId), pageable);
        } else {
            listingPage = listingRepository.findByHostId(UUID.fromString(userId), pageable);
        }

        java.util.List<ListingDetailResponse> dtoList = listingPage.getContent()
                .stream()
                .map(listingMapper::toDetailResponse)
                .collect(java.util.stream.Collectors.toList());

        return PaginationResponse.<ListingDetailResponse>builder()
                .content(dtoList)
                .totalPages(listingPage.getTotalPages())
                .totalElements(listingPage.getTotalElements())
                .build();
    }

    public ListingDetailResponse getDetailListing(UUID id){
        Listing listing = listingRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ListingErrorCode.LISTING_NOT_FOUND));

        return listingMapper.toDetailResponse(listing);
    }

    @Transactional
    public void createListing(String userId, SaveListingRequest request) {
        Listing listing = listingMapper.toEntity(request);
        listing.setHostId(UUID.fromString(userId));
        listing.setStatus(ListingStatus.ACTIVE);
        listingRepository.save(listing);
    }

    @Transactional
    public void updateListing(UUID listingId, String userId, SaveListingRequest request) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new com.Listing.CatalogandListing.exception.AppException(
                        com.Listing.CatalogandListing.exception.ListingErrorCode.LISTING_NOT_FOUND));

        if (!listing.getHostId().equals(UUID.fromString(userId))) {
            throw new com.Listing.CatalogandListing.exception.AppException(
                    com.Listing.CatalogandListing.exception.ListingErrorCode.LISTING_ACCESS_DENIED);
        }

        listingMapper.updateEntityFromRequest(request, listing);
        listingRepository.save(listing);
    }

    @Transactional
    public void deleteListing(UUID listingId, String userId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new com.Listing.CatalogandListing.exception.AppException(
                        com.Listing.CatalogandListing.exception.ListingErrorCode.LISTING_NOT_FOUND));

        if (!listing.getHostId().equals(UUID.fromString(userId))) {
            throw new com.Listing.CatalogandListing.exception.AppException(
                    com.Listing.CatalogandListing.exception.ListingErrorCode.LISTING_ACCESS_DENIED);
        }

        listing.setStatus(ListingStatus.DELETED);
        listingRepository.save(listing);
    }
}
