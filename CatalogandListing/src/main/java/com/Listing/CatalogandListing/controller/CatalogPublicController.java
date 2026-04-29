package com.Listing.CatalogandListing.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/catalog/listings")
public class CatalogPublicController {

    /**
     * 3.1.1. Xem chi tiết một Dịch vụ (Listing Detail)
     * Phương thức: GET
     * Auth: Không yêu cầu
     * 
     * @param listingId ID của dịch vụ cần xem chi tiết
     * @return Response chứa thông tin chi tiết dịch vụ (kèm JSONB attributes)
     */
    @GetMapping("/{listingId}")
    public ResponseEntity<?> getListingDetail(@PathVariable UUID listingId) {
        // TODO: Code logic lấy chi tiết Listing theo ID.
        // Trả về 200 OK nếu tìm thấy, 404 Not Found nếu không tồn tại hoặc đã bị ẩn.
        return ResponseEntity.ok().build();
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
        // TODO: Code logic query danh sách Review theo listingId, kết hợp phân trang (Pageable).
        return ResponseEntity.ok().build();
    }
}
