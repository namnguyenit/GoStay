package com.Listing.CatalogandListing.entity.attributes;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class ChefAttributes extends BaseListingAttributes {
    
    private ChefDetail serviceDetail;
    @Data
    public static class ChefDetail {
        private List<String> cuisineType;
        private Boolean includesIngredients;
        private Boolean cleanUpAfter;
        private List<String> specialDietary;
    }
    
    private Logistics logistics;
}
