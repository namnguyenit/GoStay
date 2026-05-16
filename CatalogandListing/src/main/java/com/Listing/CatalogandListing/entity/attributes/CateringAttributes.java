package com.Listing.CatalogandListing.entity.attributes;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class CateringAttributes extends BaseListingAttributes {
    
    private CateringDetail serviceDetail;
    @Data
    public static class CateringDetail {
        private List<String> eventType;
        private String menuType;
        private ExpAttributes.GroupSize guestCapacity;
        private Boolean includesStaff;
        private Boolean includesTableware;
    }
    
    private Logistics logistics;
}
