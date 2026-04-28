package com.Listing.CatalogandListing.entity.attributes;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class MakeupAttributes extends BaseListingAttributes {
    
    private MakeupDetail serviceDetail;
    @Data
    public static class MakeupDetail {
        private List<String> makeupStyle;
        private Boolean includesHair;
        private Integer durationMinutes;
        private List<String> brandsUsed;
    }
    
    private Logistics logistics;
}
