package com.Listing.CatalogandListing.client;

import com.Listing.CatalogandListing.dto.response.OrderCompletionResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "cart-order", url = "${services.order.url:http://localhost:8084}")
public interface OrderClient {

    @GetMapping("/api/v1/internal/orders/users/{userId}/listings/{listingId}/completed")
    OrderCompletionResponse hasCompletedListingOrder(
            @PathVariable("userId") UUID userId,
            @PathVariable("listingId") UUID listingId
    );
}
