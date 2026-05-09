package com.Listing.CatalogandListing.entity.attributes;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class ExpAttributes extends BaseListingAttributes {
    private ExpDetail expDetail;
    private List<String> inclusions;
    private List<String> exclusions;
    private List<Itinerary> itinerary;

    @Data
    public static class ExpDetail {
        private Integer durationMinutes;
        private String difficulty;
        private List<String> languages;
        private GroupSize groupSize;
        private String meetingPoint;
        private Double meetingPointLat;
        private Double meetingPointLng;
    }

    @Data
    public static class GroupSize {
        private Integer min;
        private Integer max;
    }

    @Data
    public static class Itinerary {
        private String time;
        private String activity;
    }
}
