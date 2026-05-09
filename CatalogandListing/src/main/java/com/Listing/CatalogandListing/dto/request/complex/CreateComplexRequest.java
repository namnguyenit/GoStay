package com.Listing.CatalogandListing.dto.request.complex;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateComplexRequest {
    @NotBlank(message = "Tên Tổ hợp không được để trống")
    private String name;

    private String description;

    @NotBlank(message = "Tỉnh/Thành phố không được để trống")
    private String province;

    @NotNull(message = "Vĩ độ không được để trống")
    private Double latitude;

    @NotNull(message = "Kinh độ không được để trống")
    private Double longitude;

    private String thumbnailUrl;

    private List<String> galleryUrls;
}
