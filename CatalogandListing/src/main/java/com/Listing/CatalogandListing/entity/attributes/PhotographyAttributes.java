package com.Listing.CatalogandListing.entity.attributes;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class PhotographyAttributes extends BaseListingAttributes {
    
    private PhotographyDetail serviceDetail;
    @Data
    public static class PhotographyDetail {
        private String providerType;
        private Integer durationMinutes;
        private Integer deliveryDays;
        private String deliverables;
        private String cameraGear;
    }
    
    private Logistics logistics;
}
