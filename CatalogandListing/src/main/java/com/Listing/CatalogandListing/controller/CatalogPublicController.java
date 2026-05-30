package com.Listing.CatalogandListing.controller;

import com.Listing.CatalogandListing.dto.response.ApiResponse;
import com.Listing.CatalogandListing.dto.response.ListingDetailResponse;
import com.Listing.CatalogandListing.dto.response.PaginationResponse;
import com.Listing.CatalogandListing.dto.response.ReviewItemResponse;
import com.Listing.CatalogandListing.entity.Landmark;
import com.Listing.CatalogandListing.service.ListingService;
import com.Listing.CatalogandListing.service.ReviewService;
import com.Listing.CatalogandListing.service.LandmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.Map;
import com.Listing.CatalogandListing.entity.Listing;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/catalog/listings")
public class CatalogPublicController {
    final ListingService listingService;
    final ReviewService reviewService;
    final LandmarkService landmarkService;

    /**
     * Tìm kiếm và hiển thị danh sách Dịch vụ công khai (sắp xếp theo averageRating giảm dần)
     * Lộ trình: GET /api/v1/catalog/listings
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PaginationResponse<ListingDetailResponse>>> searchListings(
            @RequestParam(required = false) com.Listing.CatalogandListing.enums.ListingCategory category,
            @RequestParam(required = false) String province,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PaginationResponse<ListingDetailResponse> response = listingService.searchListings(category, province, page, size);
        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm danh sách dịch vụ thành công.", response));
    }

    /**
     * Lấy danh sách Địa danh nổi tiếng công khai (Landmarks)
     * Lộ trình: GET /api/v1/catalog/listings/landmarks
     */
    @GetMapping("/landmarks/{landmarkId}/nearby")
    public ResponseEntity<ApiResponse<Map<String, List<Listing>>>> getNearbyListings(
            @PathVariable UUID landmarkId,
            @RequestParam(defaultValue = "5000") double radius) {
        Map<String, List<Listing>> nearby = landmarkService.getNearbyListings(landmarkId, radius);
        return ResponseEntity.ok(ApiResponse.success("Success", nearby));
    }

    @GetMapping("/landmarks")
    public ResponseEntity<ApiResponse<List<Landmark>>> getPublicLandmarks() {
        List<Landmark> data = landmarkService.getPublicLandmarks();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách địa danh nổi tiếng thành công.", data));
    }

    /**
     * 3.1.1. Xem chi tiết một Dịch vụ (Listing Detail)
     * Phương thức: GET
     * Auth: Không yêu cầu
     * 
     * @param listingId ID của dịch vụ cần xem chi tiết
     * @return Response chứa thông tin chi tiết dịch vụ (kèm JSONB attributes)
     */
    @GetMapping("/{listingId}")
    public ResponseEntity<ApiResponse<ListingDetailResponse>> getListingDetail(@PathVariable UUID listingId) {
        ListingDetailResponse listingDetailResponse = listingService.getDetailListing(listingId);
        return ResponseEntity.ok(ApiResponse.success("Lấy thành công chi tiết dịch vụ" , listingDetailResponse));
    }

    /**
     * 3.1.2. Xem danh sách Đánh giá (Reviews) của Dịch vụ
     * Phương thức: GET
     * Auth: Không yêu cầu
     * 
     * @param listingId ID của dịch vụ
     * @param page Số trang phân trang (mặc định 0)
     * @param size Số phần tử trên một trang (mặc định 10)
     * @return Danh sách các review của dịch vụ, có phân trang
     */
    @GetMapping("/{listingId}/reviews")
    public ResponseEntity<ApiResponse<PaginationResponse<ReviewItemResponse>>> getListingReviews(
            @PathVariable UUID listingId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        PaginationResponse<ReviewItemResponse> response = reviewService.getListingReviews(listingId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đánh giá thành công", response));
    }
}
