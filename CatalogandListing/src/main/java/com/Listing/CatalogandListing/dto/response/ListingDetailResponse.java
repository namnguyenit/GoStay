package com.Listing.CatalogandListing.dto.response;

import com.Listing.CatalogandListing.entity.attributes.BaseListingAttributes;
import com.Listing.CatalogandListing.enums.ListingCategory;
import com.Listing.CatalogandListing.enums.ListingStatus;
import com.Listing.CatalogandListing.enums.PriceUnit;
import com.Listing.CatalogandListing.enums.SubCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ListingDetailResponse {
    private UUID id;
    private UUID hostId;
    private UUID complexId;
    private String title;
    private String description;
    private String province;
    private ListingCategory category;
    private SubCategory subCategory;
    private BigDecimal basePrice;
    private PriceUnit priceUnit;
    private Double latitude;
    private Double longitude;
    private String thumbnailUrl;
    private BigDecimal averageRating;
    private Integer totalReviews;
    private ListingStatus status;
    private BaseListingAttributes attributes;
}
