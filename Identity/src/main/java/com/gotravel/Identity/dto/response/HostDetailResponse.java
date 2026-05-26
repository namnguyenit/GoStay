package com.gotravel.Identity.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HostDetailResponse {
    String accountId;
    String fullName;
    String avatarUrl;
    String hostType; // ENTERPRISE or PERSONAL (can derive from user roles/profile)
    IdentityInfo identityInfo;
    String approvalStatus;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class IdentityInfo {
        String taxCode;
        String frontImageUrl;
        String backImageUrl;
    }
}
