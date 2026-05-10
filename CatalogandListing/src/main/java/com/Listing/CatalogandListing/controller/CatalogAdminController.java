package com.Listing.CatalogandListing.controller;

import com.Listing.CatalogandListing.dto.request.landmark.SaveLandmarkRequest;
import com.Listing.CatalogandListing.dto.request.landmark.UpdateLandmarkStatusRequest;
import com.Listing.CatalogandListing.dto.request.landmark.UpdateSuggestionStatusRequest;
import com.Listing.CatalogandListing.dto.response.ApiResponse;
import com.Listing.CatalogandListing.dto.response.PaginationResponse;
import com.Listing.CatalogandListing.dto.response.LandmarkSuggestionResponse;
import com.Listing.CatalogandListing.dto.request.review.ModerateReviewRequest;
import com.Listing.CatalogandListing.service.LandmarkService;
import com.Listing.CatalogandListing.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/catalog/admin")
@RequiredArgsConstructor
public class CatalogAdminController {

    final LandmarkService landmarkService;
    final ReviewService reviewService;

    /**
     * 3.4.1. Xem danh sách Đề xuất Địa danh (Landmark Suggestions)
     * Phương thức: GET
     * Auth: Header Authorization: Bearer <token> (Role: ADMIN)
     * 
     * @param status Trạng thái cần lọc (PENDING, RESOLVED, REJECTED)
     * @param page   Số trang
     * @param size   Số phần tử mỗi trang
     * @return Danh sách đề xuất phân trang
     */
    @GetMapping("/landmark-suggestions")
    public ResponseEntity<ApiResponse<PaginationResponse<LandmarkSuggestionResponse>>> getLandmarkSuggestions(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PaginationResponse<LandmarkSuggestionResponse> response = landmarkService.getLandmarkSuggestions(status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đề xuất thành công.", response));
    }

    /**
     * 3.4.2. Xử lý Đề xuất (Approve/Reject Suggestion)
     * Phương thức: PUT
     * Auth: Role ADMIN
     * 
     * @param suggestionId ID của đề xuất
     * @param request      DTO chứa status (REJECTED/RESOLVED) và rejectReason (nếu
     *                     REJECTED)
     * @return 200 OK
     */
    @PutMapping("/landmark-suggestions/{suggestionId}/status")
    public ResponseEntity<ApiResponse<Void>> updateSuggestionStatus(
            @PathVariable UUID suggestionId,
            @RequestBody @Valid UpdateSuggestionStatusRequest request) {
        landmarkService.updateSuggestionStatus(suggestionId, request);
        return ResponseEntity.ok(ApiResponse.success("Xử lý đề xuất địa danh thành công."));
    }

    /**
     * 3.4.3. TẠO ĐỊA DANH CHÍNH THỨC (CREATE LANDMARK)
     * Phương thức: POST
     * Auth: Role ADMIN
     * 
     * @param request DTO tạo Landmark.
     * @return 201 Created
     */
    @PostMapping("/landmarks")
    public ResponseEntity<ApiResponse<Void>> createLandmark(@RequestBody @Valid SaveLandmarkRequest request) {
        landmarkService.createLandmark(request);
        return ResponseEntity.status(201).body(ApiResponse.created("Tạo địa danh mới thành công."));
    }

    /**
     * 3.4.4. Cập nhật Địa danh
     * Phương thức: PUT
     * Auth: Role ADMIN
     * 
     * @param landmarkId ID của địa danh
     * @param request    DTO chứa thông tin mới để ghi đè
     * @return 200 OK
     */
    @PutMapping("/landmarks/{landmarkId}")
    public ResponseEntity<ApiResponse<Void>> updateLandmark(@PathVariable UUID landmarkId,
            @RequestBody @Valid SaveLandmarkRequest request) {
        landmarkService.updateLandmark(landmarkId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật địa danh thành công."));
    }

    /**
     * 3.4.5. Thay đổi Trạng thái Địa danh (Change Status)
     * Phương thức: PATCH
     * Luật: Cấm dùng phương thức DELETE với Landmark.
     * Auth: Role ADMIN
     * 
     * @param landmarkId ID của địa danh
     * @param request    DTO chứa status mới (ACTIVE, MAINTENANCE, HIDDEN)
     * @return 200 OK
     */
    @PatchMapping("/landmarks/{landmarkId}/status")
    public ResponseEntity<ApiResponse<Void>> changeLandmarkStatus(
            @PathVariable UUID landmarkId,
            @RequestBody @Valid UpdateLandmarkStatusRequest request) {
        landmarkService.changeLandmarkStatus(landmarkId, request);
        return ResponseEntity.ok(ApiResponse.success("Đổi trạng thái địa danh thành công."));
    }

    /**
     * 2.4. Kiểm duyệt Đánh giá (Moderate Review)
     * Phương thức: PATCH
     * Auth: Role ADMIN
     */
    @PatchMapping("/reviews/{reviewId}/status")
    public ResponseEntity<ApiResponse<Void>> moderateReview(
            @PathVariable UUID reviewId,
            @RequestBody @Valid ModerateReviewRequest request) {
        reviewService.moderateReview(reviewId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái đánh giá thành công."));
    }
}
