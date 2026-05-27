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
import com.Listing.CatalogandListing.client.InventoryClient;
import com.Listing.CatalogandListing.dto.request.InitializeInventoryRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class ListingService {

    ListingMapper listingMapper;
    ListingRepository listingRepository;
    InventoryClient inventoryClient;

    public PaginationResponse<ListingDetailResponse> getListingsByHost(String userId, int page, int size) {
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        Page<Listing> listingPage = listingRepository.findByHostId(UUID.fromString(userId), pageable);

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

    public void createListing(String userId, SaveListingRequest request) {
        Listing listing = listingMapper.toEntity(request);
        listing.setHostId(UUID.fromString(userId));
        listing.setStatus(ListingStatus.ACTIVE);
        listing = listingRepository.save(listing);

        // Call Inventory Service to automatically create calendar
        try {
            InitializeInventoryRequest initReq = InitializeInventoryRequest.builder()
                .listingId(listing.getId())
                .totalQuantity(5) // Default quantity for demo
                .build();
            inventoryClient.initializeInventory(initReq);
            log.info("Successfully requested inventory initialization for listing {}", listing.getId());
        } catch (Exception e) {
            log.error("Failed to initialize inventory for listing {}", listing.getId(), e);
        }
    }

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

    public PaginationResponse<ListingDetailResponse> getAllListings(String status, int page, int size) {
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        Page<Listing> listingPage;
        if (status != null && !status.isBlank()) {
            ListingStatus enumStatus = ListingStatus.valueOf(status.toUpperCase());
            listingPage = listingRepository.findByStatus(enumStatus, pageable);
        } else {
            listingPage = listingRepository.findAll(pageable);
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

    public PaginationResponse<ListingDetailResponse> searchListings(com.Listing.CatalogandListing.enums.ListingCategory category, String province, int page, int size) {
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "averageRating"));
        Page<Listing> listingPage;
        if (category != null && province != null && !province.isBlank()) {
            listingPage = listingRepository.findByStatusAndCategoryAndProvince(ListingStatus.ACTIVE, category, province, pageable);
        } else if (category != null) {
            listingPage = listingRepository.findByStatusAndCategory(ListingStatus.ACTIVE, category, pageable);
        } else if (province != null && !province.isBlank()) {
            listingPage = listingRepository.findByStatusAndProvince(ListingStatus.ACTIVE, province, pageable);
        } else {
            listingPage = listingRepository.findByStatus(ListingStatus.ACTIVE, pageable);
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

    public void changeListingStatus(UUID listingId, ListingStatus status) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new com.Listing.CatalogandListing.exception.AppException(
                        com.Listing.CatalogandListing.exception.ListingErrorCode.LISTING_NOT_FOUND));

        listing.setStatus(status);
        listingRepository.save(listing);
    }
}
