package com.gotravel.Identity.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminApplicationDetailResponse {
    UserInfo user;
    ApplicationInfo application;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class UserInfo {
        String id;
        String username;
        String email;
        Boolean isActive;
        Set<String> roles;
        String avatarUrl;
        UserProfileResponse userProfile;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class ApplicationInfo {
        String type;
        String approvalStatus;

        String fullName;
        String phone;
        String cccdNumber;
        String taxCode;
        String idCard;
        String frontImageUrl;
        String backImageUrl;
        String bankAccount;
        String bankName;

        String companyName;
        String companyAddress;
        String representativeName;
    }
}
