package com.Listing.CatalogandListing.controller;

import com.Listing.CatalogandListing.dto.request.ListingRequest;
import com.Listing.CatalogandListing.dto.request.ListingServiceRequest;
import com.Listing.CatalogandListing.dto.response.ListingResponse;
import com.Listing.CatalogandListing.service.ListingBusinessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingBusinessService businessService;

    @PostMapping
    @PreAuthorize("hasAnyRole('HOST', 'ENTERPRISE')")
    public ResponseEntity<ListingResponse> createListing(@RequestBody ListingRequest request) {
        return ResponseEntity.ok(businessService.createListing(request));
    }

    @PostMapping("/services")
    @PreAuthorize("hasAnyRole('HOST', 'ENTERPRISE')")
    public ResponseEntity<String> addService(@RequestBody ListingServiceRequest request) {
        businessService.addServiceToListing(request);
        return ResponseEntity.ok("Thêm Dịch vụ vào cơ sở thành công!");
    }

    @GetMapping("/my-listings")
    public ResponseEntity<List<ListingResponse>> getMyListings() {
        return ResponseEntity.ok(businessService.getMyListings());
    }
}
