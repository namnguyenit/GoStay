package com.gotravel.Identity.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDate;

@Entity
@Table(name = "user_profiles")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserProfile {
    @Id
    @Column(name = "user_id")
    String userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    User user;

    String fullName;
    String phoneNumber;
    LocalDate dateOfBirth;
    @Column(name = "avartar_url")
    String avatarUrl;
}
