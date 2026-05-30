package com.Listing.CatalogandListing.entity.attributes;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

@Data
@EqualsAndHashCode(callSuper = true)
public class ChefAttributes extends BaseListingAttributes {
    
    @Valid
    @NotNull(message = "Service detail is required")
    private ChefDetail serviceDetail;
    @Data
    public static class ChefDetail {
        private List<String> cuisineType;
        private Boolean includesIngredients;
        private Boolean cleanUpAfter;
        private List<String> specialDietary;
    }
    
    @Valid
    @NotNull(message = "Logistics are required")
    private Logistics logistics;
}
