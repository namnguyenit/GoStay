package com.Listing.CatalogandListing.service;

import com.Listing.CatalogandListing.dto.request.listing.SaveListingRequest;
import com.Listing.CatalogandListing.entity.Listing;
import com.Listing.CatalogandListing.enums.ListingStatus;
import com.Listing.CatalogandListing.exception.AppException;
import com.Listing.CatalogandListing.exception.ListingErrorCode;
import com.Listing.CatalogandListing.mapper.ListingMapper;
import com.Listing.CatalogandListing.repository.ListingRepository;
import com.Listing.CatalogandListing.repository.ComplexRepository;
import com.Listing.CatalogandListing.entity.Complex;
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
import com.Listing.CatalogandListing.enums.ListingCategory;
import com.Listing.CatalogandListing.enums.SubCategory;
import com.Listing.CatalogandListing.util.GeometryUtil;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class ListingService {

    ListingMapper listingMapper;
    ListingRepository listingRepository;
    ComplexRepository complexRepository;
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
        validateCategoryAndAttributes(request.getCategory(), request.getSubCategory(), request.getAttributes());
        Listing listing = listingMapper.toEntity(request);
        
        if (request.getComplexId() != null) {
            Complex complex = complexRepository.findById(request.getComplexId())
                    .orElseThrow(() -> new AppException(ListingErrorCode.COMPLEX_NOT_FOUND));
            
            if (!complex.getHostId().equals(UUID.fromString(userId))) {
                throw new AppException(ListingErrorCode.COMPLEX_ACCESS_DENIED);
            }
            
            listing.setComplex(complex);
            
            if (complex.getLatitude() != null && complex.getLongitude() != null &&
                listing.getLatitude() != null && listing.getLongitude() != null) {
                double distance = calculateDistance(
                        complex.getLatitude(), complex.getLongitude(),
                        listing.getLatitude(), listing.getLongitude()
                );
                if (distance > 3.0) {
                    throw new AppException(ListingErrorCode.LISTING_OUT_OF_RANGE);
                }
            }
        }

        listing.setHostId(UUID.fromString(userId));
        listing.setStatus(ListingStatus.ACTIVE);
        listing.setLocation(GeometryUtil.createPoint(listing.getLongitude(), listing.getLatitude()));
        listing = listingRepository.save(listing);

        // Call Inventory Service to automatically create calendar
        // Commented out: Let the host initialize and configure inventory manually from the host portal
        /*
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
        */
    }

    public void updateListing(UUID listingId, String userId, SaveListingRequest request) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new com.Listing.CatalogandListing.exception.AppException(
                        com.Listing.CatalogandListing.exception.ListingErrorCode.LISTING_NOT_FOUND));

        if (!listing.getHostId().equals(UUID.fromString(userId))) {
            throw new com.Listing.CatalogandListing.exception.AppException(
                    com.Listing.CatalogandListing.exception.ListingErrorCode.LISTING_ACCESS_DENIED);
        }
        validateCategoryAndAttributes(request.getCategory(), request.getSubCategory(), request.getAttributes());
        
        if (request.getComplexId() != null) {
            Complex complex = complexRepository.findById(request.getComplexId())
                    .orElseThrow(() -> new AppException(ListingErrorCode.COMPLEX_NOT_FOUND));
            
            if (!complex.getHostId().equals(UUID.fromString(userId))) {
                throw new AppException(ListingErrorCode.COMPLEX_ACCESS_DENIED);
            }
            
            listing.setComplex(complex);
            
            Double requestLat = request.getLatitude() != null ? request.getLatitude() : listing.getLatitude();
            Double requestLng = request.getLongitude() != null ? request.getLongitude() : listing.getLongitude();
            
            if (complex.getLatitude() != null && complex.getLongitude() != null &&
                requestLat != null && requestLng != null) {
                double distance = calculateDistance(
                        complex.getLatitude(), complex.getLongitude(),
                        requestLat, requestLng
                );
                if (distance > 3.0) {
                    throw new AppException(ListingErrorCode.LISTING_OUT_OF_RANGE);
                }
            }
        }

        listingMapper.updateEntityFromRequest(request, listing);
        listing.setLocation(GeometryUtil.createPoint(listing.getLongitude(), listing.getLatitude()));
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

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Bán kính Trái Đất (km)
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private void validateCategoryAndAttributes(ListingCategory category, SubCategory subCategory, com.Listing.CatalogandListing.entity.attributes.BaseListingAttributes attributes) {
        if (category == null || subCategory == null || attributes == null) {
            throw new AppException(ListingErrorCode.INVALID_LISTING_DATA);
        }

        switch (category) {
            case STAY:
                if (subCategory != SubCategory.NONE || !(attributes instanceof com.Listing.CatalogandListing.entity.attributes.StayAttributes)) {
                    throw new AppException(ListingErrorCode.INVALID_CATEGORY_COMBINATION);
                }
                break;
            case EXP:
                if (subCategory != SubCategory.NONE || !(attributes instanceof com.Listing.CatalogandListing.entity.attributes.ExpAttributes)) {
                    throw new AppException(ListingErrorCode.INVALID_CATEGORY_COMBINATION);
                }
                break;
            case SVC:
                if (subCategory == SubCategory.NONE) {
                    throw new AppException(ListingErrorCode.INVALID_CATEGORY_COMBINATION);
                }
                boolean validAttr = false;
                switch (subCategory) {
                    case PHOTOGRAPHY: validAttr = attributes instanceof com.Listing.CatalogandListing.entity.attributes.PhotographyAttributes; break;
                    case CHEF: validAttr = attributes instanceof com.Listing.CatalogandListing.entity.attributes.ChefAttributes; break;
                    case MASSAGE: validAttr = attributes instanceof com.Listing.CatalogandListing.entity.attributes.MassageAttributes; break;
                    case PREPARED_MEALS: validAttr = attributes instanceof com.Listing.CatalogandListing.entity.attributes.PreparedMealsAttributes; break;
                    case TRAINING: validAttr = attributes instanceof com.Listing.CatalogandListing.entity.attributes.TrainingAttributes; break;
                    case MAKEUP: validAttr = attributes instanceof com.Listing.CatalogandListing.entity.attributes.MakeupAttributes; break;
                    case HAIR_STYLING: validAttr = attributes instanceof com.Listing.CatalogandListing.entity.attributes.HairStylingAttributes; break;
                    case SPA: validAttr = attributes instanceof com.Listing.CatalogandListing.entity.attributes.SpaAttributes; break;
                    case CATERING: validAttr = attributes instanceof com.Listing.CatalogandListing.entity.attributes.CateringAttributes; break;
                    default: break;
                }
                if (!validAttr) {
                    throw new AppException(ListingErrorCode.INVALID_CATEGORY_COMBINATION);
                }
                break;
            default:
                throw new AppException(ListingErrorCode.INVALID_CATEGORY_COMBINATION);
        }
    }
}
