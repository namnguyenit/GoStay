package com.gotravel.Identity.entity;

import com.gotravel.Identity.enums.Approval_status;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "host_profiles")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HostProfile {
    @Id
    @Column(name = "user_id")
    String userId;

    String fullName;
    String phone;
    String avatar_url;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    User user;

    @Enumerated(EnumType.STRING)
    Approval_status approvalStatus;

    @Column(unique = true)
    String cccdNumber;

    String taxCode;
    String idCard;
    String frontImageUrl;
    String backImageUrl;

    String bankAccount;
    String bankName;
    String bankNameAccont;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;
}
