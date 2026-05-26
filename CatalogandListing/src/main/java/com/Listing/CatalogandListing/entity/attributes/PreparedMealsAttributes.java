package com.Listing.CatalogandListing.entity.attributes;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class PreparedMealsAttributes extends BaseListingAttributes {
    
    private PreparedMealsDetail serviceDetail;
    @Data
    public static class PreparedMealsDetail {
        private List<String> mealType;
        private String deliveryFrequency;
        private Integer mealsPerDay;
        private String caloriesPerDay;
        private String heatingInstructions;
    }
    
    private Logistics logistics;
}
