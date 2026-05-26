package com.Listing.CatalogandListing.entity.attributes;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class HairStylingAttributes extends BaseListingAttributes {
    
    private HairStylingDetail serviceDetail;
    @Data
    public static class HairStylingDetail {
        private List<String> serviceType;
        private String targetGender;
        private Boolean chemicalsIncluded;
        private Integer durationMinutes;
    }
    
    private Logistics logistics;
}
