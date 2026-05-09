package com.Listing.CatalogandListing.dto.request.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
public class SubmitReviewRequest {
    @NotNull(message = "Listing ID không được để trống")
    private UUID listingId;

    @NotNull(message = "Rating không được để trống")
    @Min(value = 1, message = "Rating nhỏ nhất là 1")
    @Max(value = 5, message = "Rating lớn nhất là 5")
    private Integer rating;

    @NotBlank(message = "Comment không được để trống")
    private String comment;

    private List<String> images;
}
