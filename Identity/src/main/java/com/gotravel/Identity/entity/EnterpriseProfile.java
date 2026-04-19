package com.gotravel.Identity.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

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

    String companyName;
    
    @Column(unique = true)
    String taxCode;
    
    String companyAddress;
    String representativeName;
}
