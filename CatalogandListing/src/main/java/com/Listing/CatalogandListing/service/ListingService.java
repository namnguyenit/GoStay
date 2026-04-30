package com.Listing.CatalogandListing.service;

import com.Listing.CatalogandListing.dto.request.listing.SaveListingRequest;
import com.Listing.CatalogandListing.entity.Listing;
import com.Listing.CatalogandListing.enums.ListingStatus;
import com.Listing.CatalogandListing.mapper.ListingMapper;
import com.Listing.CatalogandListing.repository.ListingRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ListingService {

    ListingMapper listingMapper;
    ListingRepository listingRepository;

    public void createListing(String userId, SaveListingRequest request) {
        Listing listing = listingMapper.toEntity(request);
        listing.setHostId(UUID.fromString(userId));
        listing.setStatus(ListingStatus.ACTIVE);
        listingRepository.save(listing);
    }

    public void updateListing(UUID listingId, String userId, SaveListingRequest request) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new com.Listing.CatalogandListing.exception.AppException(com.Listing.CatalogandListing.exception.ListingErrorCode.LISTING_NOT_FOUND));

        if (!listing.getHostId().equals(UUID.fromString(userId))) {
            throw new com.Listing.CatalogandListing.exception.AppException(com.Listing.CatalogandListing.exception.ListingErrorCode.LISTING_ACCESS_DENIED);
        }

        listingMapper.updateEntityFromRequest(request, listing);
        listingRepository.save(listing);
    }

    public void deleteListing(UUID listingId, String userId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new com.Listing.CatalogandListing.exception.AppException(com.Listing.CatalogandListing.exception.ListingErrorCode.LISTING_NOT_FOUND));

        if (!listing.getHostId().equals(UUID.fromString(userId))) {
            throw new com.Listing.CatalogandListing.exception.AppException(com.Listing.CatalogandListing.exception.ListingErrorCode.LISTING_ACCESS_DENIED);
        }

        listing.setStatus(ListingStatus.DELETED);
        listingRepository.save(listing);
    }
}
