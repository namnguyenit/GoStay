package com.Listing.CatalogandListing.entity.attributes;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

@Data
@EqualsAndHashCode(callSuper = true)
public class StayAttributes extends BaseListingAttributes {
    @Valid
    @NotNull(message = "Stay detail is required")
    private StayDetail stayDetail;
    private List<String> amenities;
    @Valid
    @NotNull(message = "Policies are required")
    private Policies policies;

    @Data
    public static class StayDetail {
        @NotBlank(message = "Property type is required")
        private String propertyType;
        @NotNull(message = "Room size is required")
        @Min(value = 1, message = "Room size must be at least 1")
        private Integer roomSizeSqM;
        @NotNull(message = "Max guests is required")
        @Min(value = 1, message = "Max guests must be at least 1")
        private Integer maxGuests;
        @NotNull(message = "Bedrooms is required")
        @Min(value = 0, message = "Bedrooms cannot be negative")
        private Integer bedrooms;
        @Valid
        @NotEmpty(message = "At least one bed is required")
        private List<Bed> beds;
        @NotNull(message = "Bathrooms is required")
        @Min(value = 0, message = "Bathrooms cannot be negative")
        private Integer bathrooms;
    }

    @Data
    public static class Bed {
        @NotBlank(message = "Bed type is required")
        private String type;
        @NotNull(message = "Bed quantity is required")
        @Min(value = 1, message = "Bed quantity must be at least 1")
        private Integer quantity;
    }

    @Data
    public static class Policies {
        @NotBlank(message = "Check in time is required")
        private String checkInTime;
        @NotBlank(message = "Check out time is required")
        private String checkOutTime;
        private Boolean allowPets;
        private Boolean allowSmoking;
        private Boolean partyAllowed;
    }
}
