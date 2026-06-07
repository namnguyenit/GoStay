package com.gotravel.Identity.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HostProfileResponse {
    String fullName;
    String phone;
    String cccdNumber;
    String taxCode;
    String bankAccount;
    String bankName;
    String bankAccountName;
    String frontImageUrl;
    String backImageUrl;
    String avatarUrl;
    String approvalStatus;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
