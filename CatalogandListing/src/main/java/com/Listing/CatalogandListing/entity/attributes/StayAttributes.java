package com.Listing.CatalogandListing.entity.attributes;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class StayAttributes extends BaseListingAttributes {
    private StayDetail stayDetail;
    private List<String> amenities;
    private Policies policies;

    @Data
    public static class StayDetail {
        private String propertyType;
        private Integer roomSizeSqM;
        private Integer maxGuests;
        private Integer bedrooms;
        private List<Bed> beds;
        private Integer bathrooms;
    }

    @Data
    public static class Bed {
        private String type;
        private Integer quantity;
    }

    @Data
    public static class Policies {
        private String checkInTime;
        private String checkOutTime;
        private Boolean allowPets;
        private Boolean allowSmoking;
        private Boolean partyAllowed;
    }
}
