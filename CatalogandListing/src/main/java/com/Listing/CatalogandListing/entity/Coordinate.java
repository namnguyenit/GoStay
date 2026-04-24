package com.Listing.CatalogandListing.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coordinate {
    private Double latitude; // Vĩ độ
    private Double longitude; // Kinh độ
}
