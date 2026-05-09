package com.Listing.CatalogandListing.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewItemResponse {
    private UUID id;
    private UUID userId;
    private String userName;
    private String userAvatar;
    private Integer rating;
    private String comment;
    private List<String> images;
    private LocalDateTime createdAt;
}
