package com.Listing.CatalogandListing.controller;

import com.Listing.CatalogandListing.dto.request.landmark.SuggestLandmarkRequest;
import com.Listing.CatalogandListing.dto.response.ApiResponse;
import com.Listing.CatalogandListing.service.LandmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.Listing.CatalogandListing.dto.request.complex.CreateComplexRequest;
import com.Listing.CatalogandListing.dto.request.listing.SaveListingRequest;
import com.Listing.CatalogandListing.service.ComplexService;
import com.Listing.CatalogandListing.service.ListingService;
import jakarta.validation.Valid;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/catalog/host")
public class CatalogHostController {
    final LandmarkService landmarkService;
    final ComplexService complexService;
    final ListingService listingService;

    /**
     * 3.3.1. Đề xuất Địa danh mới (Landmark Suggestion)
     * Phương thức: POST
     * Auth: Header Authorization: Bearer <token> (Role: HOST)
     * 
     * @param suggestLandmarkRequest DTO chứa thông tin địa danh do Host đề xuất
     * @return 201 Created (Trạng thái PENDING chờ Admin duyệt)
     */
    @PostMapping("/landmark-suggestions")
    public ResponseEntity<ApiResponse<Void>> suggestLandmark(
            @RequestBody SuggestLandmarkRequest suggestLandmarkRequest) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        landmarkService.suggestLandmark(userId, suggestLandmarkRequest);
        return ResponseEntity.status(201).body(ApiResponse.created("Đề nghị tạo khu vực landmark thành công."));
    }

    /**
     * 3.3.2. Tạo Siêu Tổ hợp (Chỉ dành cho Host Doanh nghiệp)
     * Phương thức: POST
     * Auth: Header Authorization: Bearer <token>
     * 
     * @param request DTO chứa thông tin khu Tổ hợp (Complex)
     * @return 201 Created hoặc 403 Forbidden (Nếu không phải ENTERPRISE)
     */
    @PostMapping("/complexes")
    public ResponseEntity<ApiResponse<Void>> createComplex(@RequestBody @Valid CreateComplexRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        complexService.createComplex(userId, request);
        return ResponseEntity.status(201).body(ApiResponse.created("Tạo khu tổ hợp thành công."));
    }

    /**
     * 3.3.3. ĐĂNG DỊCH VỤ MỚI (TẠO LISTING) - API ĐA HÌNH CỐT LÕI
     * Phương thức: POST
     * Auth: Header Authorization: Bearer <token> (Role: HOST)
     * Lưu ý: Thêm @Valid để Hibernate Validator chạy validation cho JSON
     * attributes.
     * 
     * @param request DTO chứa toàn bộ thông tin dịch vụ (có chứa cục attributes
     *                JSONB đa hình)
     * @return 201 Created cùng với Listing ID
     */
    @PostMapping("/listings")
    public ResponseEntity<ApiResponse<Void>> createListing(@RequestBody @Valid SaveListingRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        listingService.createListing(userId, request);
        return ResponseEntity.status(201).body(ApiResponse.created("Đăng dịch vụ mới thành công."));
    }

    /**
     * 3.3.4. Cập nhật Dịch vụ
     * Phương thức: PUT
     * Auth: Role HOST
     * 
     * @param listingId ID của dịch vụ cần cập nhật
     * @param request   DTO chứa toàn bộ thông tin mới để ghi đè
     * @return 200 OK
     */
    @PutMapping("/listings/{listingId}")
    public ResponseEntity<?> updateListing(@PathVariable UUID listingId, @RequestBody Object request) {
        // TODO: Lấy Host ID từ token
        // TODO: BẮT BUỘC kiểm tra (Check Authorization): Host này có phải là chủ sở hữu
        // của Listing {listingId} hay không?
        // TODO: Cập nhật thông tin Listing
        return ResponseEntity.ok().build();
    }

    /**
     * 3.3.5. Xóa Dịch vụ (Soft Delete)
     * Phương thức: DELETE
     * Auth: Role HOST
     * 
     * @param listingId ID của dịch vụ cần xóa
     * @return 200 OK
     */
    @DeleteMapping("/listings/{listingId}")
    public ResponseEntity<?> deleteListing(@PathVariable UUID listingId) {
        // TODO: Kiểm tra quyền sở hữu của Host với Listing
        // TODO: Update cột status của Listing thành "DELETED" (Soft delete) thay vì xóa
        // hoàn toàn khỏi DB
        return ResponseEntity.ok().build();
    }
}
