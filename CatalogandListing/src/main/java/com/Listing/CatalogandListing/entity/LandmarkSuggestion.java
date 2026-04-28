package com.Listing.CatalogandListing.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

import com.Listing.CatalogandListing.enums.SuggestionStatus;

@Entity
@Table(name = "landmark_suggestions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LandmarkSuggestion {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "host_id")
    private UUID hostId;

    @Column(length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "suggested_province", length = 100)
    private String suggestedProvince;

    @Column(name = "suggested_latitude")
    private Double suggestedLatitude;

    @Column(name = "suggested_longitude")
    private Double suggestedLongitude;

    @Column(name = "reference_image_url", length = 255)
    private String referenceImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private SuggestionStatus status;

    @Column(name = "reject_reason", columnDefinition = "TEXT")
    private String rejectReason;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}
