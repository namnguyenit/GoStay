package com.Listing.CatalogandListing.entity.attributes;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class SpaAttributes extends BaseListingAttributes {
    
    private SpaDetail serviceDetail;
    @Data
    public static class SpaDetail {
        private List<String> treatments;
        private Boolean organicProductsOnly;
        private Integer durationMinutes;
        private String genderPreference;
    }
    
    private Logistics logistics;
}
