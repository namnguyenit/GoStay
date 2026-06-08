package com.Listing.CatalogandListing.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.UUID;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ComplexResponse {
    UUID id;
    String name;
    String description;
    String province;
    String district;
    String ward;
    String streetAddress;
    Double latitude;
    Double longitude;
    String status;
    LocalDateTime createdAt;
}
