package com.Listing.CatalogandListing.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/catalog/reviews")
public class CatalogUserController {

    /**
     * 3.2.1. Đăng bài Đánh giá (Submit Review)
     * Phương thức: POST
     * Auth: Header Authorization: Bearer <token> (Role: USER)
     * 
     * @param request DTO chứa thông tin review (listingId, rating, comment, images array)
     * @return 201 Created nếu thành công, 403 Forbidden nếu user chưa sử dụng dịch vụ
     */
    @PostMapping
    public ResponseEntity<?> submitReview(@RequestBody Object request) { // TODO: Thay Object bằng DTO (vd: ReviewRequest)
        // TODO: Lấy User ID từ Security Context (Token)
        // TODO: Gọi Service kiểm tra xem User này đã thực sự đặt và sử dụng Listing này chưa (Check chéo với DB Booking)
        // TODO: Nếu hợp lệ -> Lưu Review vào database. Không hợp lệ -> ném lỗi 403.
        return ResponseEntity.status(201).build();
    }
}
