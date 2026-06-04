package com.Listing.CatalogandListing.controller;

import com.Listing.CatalogandListing.dto.request.review.SubmitReviewRequest;
import com.Listing.CatalogandListing.dto.response.ApiResponse;
import com.Listing.CatalogandListing.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/catalog/reviews")
@RequiredArgsConstructor
public class CatalogUserController {
    
    private final ReviewService reviewService;

    /**
     * 3.2.1. Đăng bài Đánh giá (Submit Review)
     * Phương thức: POST
     * Auth: Header Authorization: Bearer <token> (Role: USER)
     * 
     * @param request DTO chứa thông tin review (listingId, rating, comment, images array)
     * @return 201 Created nếu thành công, 403 Forbidden nếu user chưa sử dụng dịch vụ
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> submitReview(@RequestBody @Valid SubmitReviewRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        reviewService.submitReview(userId, request);
        return ResponseEntity.status(201).body(ApiResponse.created("Đăng đánh giá thành công."));
    }
}
