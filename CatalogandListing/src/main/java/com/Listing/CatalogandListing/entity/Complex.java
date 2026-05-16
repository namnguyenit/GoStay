package com.Listing.CatalogandListing.entity;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.persistence.*;
import lombok.*;

import org.locationtech.jts.geom.Point;

import com.Listing.CatalogandListing.enums.ComplexStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "complexes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Complex {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "host_id")
    private UUID hostId;

    @Column(length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String province;

    private Double latitude;
    private Double longitude;

    @Column(columnDefinition = "geometry(Point,4326)")
    private Point location;

    @Column(name = "thumbnail_url", length = 255)
    private String thumbnailUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "gallery_urls", columnDefinition = "jsonb")
    private List<String> galleryUrls;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ComplexStatus status;

    @OneToMany(mappedBy = "complex", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Listing> listings;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
