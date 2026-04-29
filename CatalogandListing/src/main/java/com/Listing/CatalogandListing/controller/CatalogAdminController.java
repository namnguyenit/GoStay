package com.Listing.CatalogandListing.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/catalog/admin")
public class CatalogAdminController {

    /**
     * 3.4.1. Xem danh sách Đề xuất Địa danh (Landmark Suggestions)
     * Phương thức: GET
     * Auth: Header Authorization: Bearer <token> (Role: ADMIN)
     * 
     * @param status Trạng thái cần lọc (PENDING, RESOLVED, REJECTED)
     * @param page Số trang
     * @param size Số phần tử mỗi trang
     * @return Danh sách đề xuất phân trang
     */
    @GetMapping("/landmark-suggestions")
    public ResponseEntity<?> getLandmarkSuggestions(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        // TODO: Viết logic lọc LandmarkSuggestion theo status và phân trang
        return ResponseEntity.ok().build();
    }

    /**
     * 3.4.2. Xử lý Đề xuất (Approve/Reject Suggestion)
     * Phương thức: PUT
     * Auth: Role ADMIN
     * 
     * @param suggestionId ID của đề xuất
     * @param request DTO chứa status (REJECTED/RESOLVED) và rejectReason (nếu REJECTED)
     * @return 200 OK
     */
    @PutMapping("/landmark-suggestions/{suggestionId}/status")
    public ResponseEntity<?> updateSuggestionStatus(
            @PathVariable UUID suggestionId, 
            @RequestBody Object request) { // TODO: Thay bằng UpdateSuggestionStatusRequest
        // TODO: Cập nhật status của Suggestion. Nếu REJECTED thì lưu kèm lý do từ chối.
        return ResponseEntity.ok().build();
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
    public ResponseEntity<?> createLandmark(@RequestBody Object request) { // TODO: Thay bằng CreateLandmarkRequest DTO
        // TODO: Tạo Landmark mới vào DB.
        // TODO: (Nghiệp vụ) Nếu trong request có truyền 'resolvedSuggestionId' thì cập nhật trạng thái của Suggestion đó thành RESOLVED.
        return ResponseEntity.status(201).build();
    }

    /**
     * 3.4.4. Cập nhật Địa danh
     * Phương thức: PUT
     * Auth: Role ADMIN
     * 
     * @param landmarkId ID của địa danh
     * @param request DTO chứa thông tin mới để ghi đè
     * @return 200 OK
     */
    @PutMapping("/landmarks/{landmarkId}")
    public ResponseEntity<?> updateLandmark(@PathVariable UUID landmarkId, @RequestBody Object request) {
        // TODO: Cập nhật thông tin Landmark
        return ResponseEntity.ok().build();
    }

    /**
     * 3.4.5. Thay đổi Trạng thái Địa danh (Change Status)
     * Phương thức: PATCH
     * Luật: Cấm dùng phương thức DELETE với Landmark.
     * Auth: Role ADMIN
     * 
     * @param landmarkId ID của địa danh
     * @param request DTO chứa status mới (ACTIVE, MAINTENANCE, HIDDEN)
     * @return 200 OK
     */
    @PatchMapping("/landmarks/{landmarkId}/status")
    public ResponseEntity<?> changeLandmarkStatus(
            @PathVariable UUID landmarkId, 
            @RequestBody Object request) { // TODO: Thay bằng UpdateLandmarkStatusRequest
        // TODO: Đổi trạng thái của Landmark thay vì xóa bỏ
        return ResponseEntity.ok().build();
    }
}
