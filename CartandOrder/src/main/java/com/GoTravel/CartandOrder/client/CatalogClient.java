package com.GoTravel.CartandOrder.client;

import com.GoTravel.CartandOrder.dto.response.ApiResponse;
import com.GoTravel.CartandOrder.dto.response.CatalogListingResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "catalog-listing", url = "${services.catalog.url:http://localhost:8082}")
public interface CatalogClient {

    @GetMapping("/api/v1/catalog/listings/{listingId}")
    ApiResponse<CatalogListingResponse> getListingDetail(@PathVariable("listingId") UUID listingId);
}
