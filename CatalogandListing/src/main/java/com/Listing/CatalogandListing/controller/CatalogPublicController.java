package com.Listing.CatalogandListing.controller;

import com.Listing.CatalogandListing.dto.response.ApiResponse;
import com.Listing.CatalogandListing.dto.response.ListingDetailResponse;
import com.Listing.CatalogandListing.service.ListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/catalog/listings")
public class CatalogPublicController {
    final ListingService listingService;

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
    public ResponseEntity<?> getListingReviews(
            @PathVariable UUID listingId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok().build();
    }
}
