package com.gotravel.Identity.entity;

import com.gotravel.Identity.enums.Approval_status;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "enterprise_profiles")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EnterpriseProfile {
    @Id
    @Column(name = "user_id")
    String userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    User user;

    @Enumerated(EnumType.STRING)
    Approval_status approvalStatus;

    String companyName;
    
    @Column(unique = true)
    String taxCode;
    
    String companyAddress;
    String representativeName;
    String bankAccount;
    String bankName;
    String bankAccountName;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;
}
