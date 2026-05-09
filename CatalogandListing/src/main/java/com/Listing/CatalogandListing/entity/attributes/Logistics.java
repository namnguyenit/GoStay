package com.Listing.CatalogandListing.entity.attributes;

import lombok.Data;

@Data
public class Logistics {
    private Boolean serveAtClientLocation;
    private Integer maxTravelRadiusKm;
    private String equipmentRequiredFromClient;
    private String deliveryTimeWindow;
    private String facilityRequired;
    private Boolean cleanupProvided;
    private String equipmentProvided;
    private Integer setupTimeHours;
}
