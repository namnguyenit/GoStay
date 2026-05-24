package com.Listing.CatalogandListing.entity.attributes;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class MassageAttributes extends BaseListingAttributes {
    
    private MassageDetail serviceDetail;
    @Data
    public static class MassageDetail {
        private List<String> massageType;
        private Integer durationMinutes;
        private String genderPreference;
        private String equipmentProvided;
    }
    
    private Logistics logistics;
}
