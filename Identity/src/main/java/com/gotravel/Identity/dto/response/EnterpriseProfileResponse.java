package com.gotravel.Identity.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EnterpriseProfileResponse {
    String companyName;
    String taxCode;
    String companyAddress;
    String representativeName;
    String bankAccount;
    String bankName;
    String bankAccountName;
    String avatarUrl;
    String approvalStatus;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
