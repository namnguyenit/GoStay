package com.Listing.CatalogandListing.dto.request.landmark;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuggestLandmarkRequest {
    @NotBlank(message = "Tên địa danh không được để trống")
    private String name;

    private String description;

    @NotBlank(message = "Tỉnh/Thành phố không được để trống")
    private String suggestedProvince;

    @NotNull(message = "Vĩ độ không được để trống")
    private Double suggestedLatitude;

    @NotNull(message = "Kinh độ không được để trống")
    private Double suggestedLongitude;

    private String referenceImageUrl;

    private String thumbnailUrl;
    private java.util.List<String> galleryUrls;
}
