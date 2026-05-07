package com.gotravel.Identity.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import com.gotravel.Identity.enums.Provider;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    String id;
    String username;
    String email;
    Boolean isActive;
    Provider provider;
    Set<String> roles;
    
    UserProfileResponse userProfile;
    HostProfileResponse hostProfile;
    EnterpriseProfileResponse enterpriseProfile;
}
