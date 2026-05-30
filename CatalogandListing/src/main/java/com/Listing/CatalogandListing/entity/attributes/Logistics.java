package com.Listing.CatalogandListing.entity.attributes;

import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class Logistics {
    @NotNull(message = "serveAtClientLocation is required")
    private Boolean serveAtClientLocation;
    @NotNull(message = "maxTravelRadiusKm is required")
    private Integer maxTravelRadiusKm;
    private String equipmentRequiredFromClient;
    private String deliveryTimeWindow;
    private String facilityRequired;
    private Boolean cleanupProvided;
    private String equipmentProvided;
    private Integer setupTimeHours;
}
