package com.gotravel.Identity.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HostProfileResponse {
    String cccdNumber;
    String bankAccount;
    String bankName;
    String avatarUrl;
    String approvalStatus;
}
