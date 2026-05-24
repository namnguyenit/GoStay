package com.Listing.CatalogandListing.client;

import com.Listing.CatalogandListing.dto.request.InitializeInventoryRequest;
import com.Listing.CatalogandListing.dto.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "booking-inventory", url = "http://localhost:8083")
public interface InventoryClient {

    @PostMapping("/api/v1/internal/inventory/initialize")
    ApiResponse<Void> initializeInventory(@RequestBody InitializeInventoryRequest request);
}
