package com.Listing.CatalogandListing.entity.attributes;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;
import jakarta.validation.Valid;
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
        private Double meetingPointLat;
        @NotNull(message = "Meeting point longitude is required")
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
