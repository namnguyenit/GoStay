package com.Listing.CatalogandListing.controller;

import com.Listing.CatalogandListing.dto.request.landmark.SuggestLandmarkRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/catalog/host")
public class CatalogHostController {

    /**
     * 3.3.1. Đề xuất Địa danh mới (Landmark Suggestion)
     * Phương thức: POST
     * Auth: Header Authorization: Bearer <token> (Role: HOST)
     * 
     * @param suggestLandmarkRequest DTO chứa thông tin địa danh do Host đề xuất
     * @return 201 Created (Trạng thái PENDING chờ Admin duyệt)
     */
    @PostMapping("/landmark-suggestions")
    public ResponseEntity<?> suggestLandmark(@RequestBody SuggestLandmarkRequest suggestLandmarkRequest) { // TODO: Thay bằng SuggestionRequest DTO
        String id = SecurityContextHolder.getContext().getAuthentication().getName();

        return ResponseEntity.status(201).build();
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
    public ResponseEntity<?> createComplex(@RequestBody Object request) { // TODO: Thay bằng ComplexRequest DTO
        // TODO: Kiểm tra role/quyền xem Host này có phải DOANH NGHIỆP không
        // TODO: Tạo bản ghi Complex mới
        return ResponseEntity.status(201).build();
    }

    /**
     * 3.3.3. ĐĂNG DỊCH VỤ MỚI (TẠO LISTING) - API ĐA HÌNH CỐT LÕI
     * Phương thức: POST
     * Auth: Header Authorization: Bearer <token> (Role: HOST)
     * Lưu ý: Thêm @Valid để Hibernate Validator chạy validation cho JSON attributes.
     * 
     * @param request DTO chứa toàn bộ thông tin dịch vụ (có chứa cục attributes JSONB đa hình)
     * @return 201 Created cùng với Listing ID
     */
    @PostMapping("/listings")
    public ResponseEntity<?> createListing(@RequestBody Object request) { // TODO: Thay bằng @Valid CreateListingRequest DTO
        // TODO: Lấy Host ID từ token
        // TODO: Xử lý lưu Listing mới vào DB. Dữ liệu JSONB sẽ tự động được Jackson parse thành Subclass (Stay/Exp/Svc)
        return ResponseEntity.status(201).build();
    }

    /**
     * 3.3.4. Cập nhật Dịch vụ
     * Phương thức: PUT
     * Auth: Role HOST
     * 
     * @param listingId ID của dịch vụ cần cập nhật
     * @param request DTO chứa toàn bộ thông tin mới để ghi đè
     * @return 200 OK
     */
    @PutMapping("/listings/{listingId}")
    public ResponseEntity<?> updateListing(@PathVariable UUID listingId, @RequestBody Object request) {
        // TODO: Lấy Host ID từ token
        // TODO: BẮT BUỘC kiểm tra (Check Authorization): Host này có phải là chủ sở hữu của Listing {listingId} hay không?
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
        // TODO: Update cột status của Listing thành "DELETED" (Soft delete) thay vì xóa hoàn toàn khỏi DB
        return ResponseEntity.ok().build();
    }
}
