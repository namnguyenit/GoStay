package com.Listing.CatalogandListing.entity.attributes;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class TrainingAttributes extends BaseListingAttributes {
    
    private TrainingDetail serviceDetail;
    @Data
    public static class TrainingDetail {
        private String skillTaught;
        private String level;
        private Integer durationMinutes;
        private ExpAttributes.GroupSize groupSize;
        private String equipmentProvided;
    }
    
    private Logistics logistics;
}
