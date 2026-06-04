package com.Listing.CatalogandListing.dto.request.landmark;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveLandmarkRequest {
    @NotBlank(message = "Tên địa danh không được để trống")
    private String name;

    private String description;

    @NotBlank(message = "Tỉnh/Thành phố không được để trống")
    private String province;

    @NotNull(message = "Vĩ độ không được để trống")
    @DecimalMin(value = "-90.0", message = "Vĩ độ phải nằm trong khoảng [-90, 90]")
    @DecimalMax(value = "90.0", message = "Vĩ độ phải nằm trong khoảng [-90, 90]")
    private Double latitude;

    @NotNull(message = "Kinh độ không được để trống")
    @DecimalMin(value = "-180.0", message = "Kinh độ phải nằm trong khoảng [-180, 180]")
    @DecimalMax(value = "180.0", message = "Kinh độ phải nằm trong khoảng [-180, 180]")
    private Double longitude;

    private Integer radiusMeters;
    
    private String thumbnailUrl;
    
    private List<String> galleryUrls;

    private UUID resolvedSuggestionId;

    private Boolean isFeatured;
}
