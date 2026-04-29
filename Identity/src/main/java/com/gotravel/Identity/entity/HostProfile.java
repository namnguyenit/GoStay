package com.gotravel.Identity.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

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

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    User user;

    @Column(unique = true)
    String cccdNumber;
    
    String bankAccount;
    String bankName;
}
