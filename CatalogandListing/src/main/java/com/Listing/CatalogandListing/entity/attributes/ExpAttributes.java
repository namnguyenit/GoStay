package com.Listing.CatalogandListing.entity.attributes;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@EqualsAndHashCode(callSuper = true)
public class ExpAttributes extends BaseListingAttributes {
    @Valid
    @NotNull(message = "Exp detail is required")
    private ExpDetail expDetail;
    private List<String> inclusions;
    private List<String> exclusions;
    private List<Itinerary> itinerary;

    @Data
    public static class ExpDetail {
        @NotNull(message = "Duration is required")
        @Min(value = 1, message = "Duration must be at least 1")
        private Integer durationMinutes;
        private String difficulty;
        private List<String> languages;
        @Valid
        @NotNull(message = "Group size is required")
        private GroupSize groupSize;
        @NotBlank(message = "Meeting point is required")
        private String meetingPoint;
        @NotNull(message = "Meeting point latitude is required")
        @DecimalMin(value = "-90.0", message = "Meeting point latitude must be between -90 and 90")
        @DecimalMax(value = "90.0", message = "Meeting point latitude must be between -90 and 90")
        private Double meetingPointLat;
        @NotNull(message = "Meeting point longitude is required")
        @DecimalMin(value = "-180.0", message = "Meeting point longitude must be between -180 and 180")
        @DecimalMax(value = "180.0", message = "Meeting point longitude must be between -180 and 180")
        private Double meetingPointLng;
    }

    @Data
    public static class GroupSize {
        @NotNull(message = "Min group size is required")
        @Min(value = 1, message = "Min group size must be at least 1")
        private Integer min;
        @NotNull(message = "Max group size is required")
        @Min(value = 1, message = "Max group size must be at least 1")
        private Integer max;
    }

    @Data
    public static class Itinerary {
        private String time;
        private String activity;
    }
}
