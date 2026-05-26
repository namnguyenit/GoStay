package com.Listing.CatalogandListing.dto.request.listing;

import com.Listing.CatalogandListing.entity.attributes.BaseListingAttributes;
import com.Listing.CatalogandListing.enums.ListingCategory;
import com.Listing.CatalogandListing.enums.PriceUnit;
import com.Listing.CatalogandListing.enums.SubCategory;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class SaveListingRequest {
    private UUID complexId;

    @NotNull(message = "Category không được để trống")
    private ListingCategory category;

    @NotNull(message = "SubCategory không được để trống")
    private SubCategory subCategory;

    @NotBlank(message = "Title không được để trống")
    private String title;

    private String description;

    @NotBlank(message = "Province không được để trống")
    private String province;

    @NotNull(message = "Base price không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá cơ bản phải lớn hơn 0")
    private BigDecimal basePrice;

    @NotNull(message = "Price unit không được để trống")
    private PriceUnit priceUnit;

    @NotNull(message = "Latitude không được để trống")
    private Double latitude;

    @NotNull(message = "Longitude không được để trống")
    private Double longitude;

    private String thumbnailUrl;

    @Valid
    @NotNull(message = "Attributes không được để trống")
    private BaseListingAttributes attributes;
}
