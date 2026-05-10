package com.Listing.CatalogandListing.entity;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.persistence.*;
import lombok.*;
import com.Listing.CatalogandListing.enums.ReviewStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "reviews", indexes = {
    @Index(name = "idx_review_listing_id", columnList = "listing_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id")
    private Listing listing;

    @Column(name = "user_id")
    private UUID userId;

    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> images;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private ReviewStatus status;

    @Column(name = "reply_comment", columnDefinition = "TEXT")
    private String replyComment;

    @Column(name = "moderation_reason", columnDefinition = "TEXT")
    private String moderationReason;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = ReviewStatus.ACTIVE;
        }
    }
}
