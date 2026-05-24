package com.gotravel.Identity.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminApplicationSummaryResponse {
    String userId;
    String type;
    String username;
    String email;
    String fullName;
    String phone;
    String approvalStatus;
    String avatarUrl;
}
