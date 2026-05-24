package com.gotravel.Identity.mapper;

import com.gotravel.Identity.dto.request.*;
import com.gotravel.Identity.dto.response.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import com.gotravel.Identity.entity.*;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse userRequestToUserResponse(UserRequest userRequest);
    User userRequestToUser(UserRequest userRequest);
    @Mapping(target = "avatarUrl", source = "userProfile.avatarUrl")
    UserResponse userToUserResponse(User user);

    UserProfileResponse toUserProfileResponse(UserProfile userProfile);
    void updateUserProfileFromRequest(UserProfileRequest dto, @MappingTarget UserProfile profile);

    HostProfileResponse toHostProfileResponse(HostProfile hostProfile);
    void updateHostProfileFromRequest(HostProfileRequest dto, @MappingTarget HostProfile profile);

    EnterpriseProfileResponse toEnterpriseProfileResponse(EnterpriseProfile enterpriseProfile);
    void updateEnterpriseProfileFromRequest(EnterpriseProfileRequest dto, @MappingTarget EnterpriseProfile profile);

    default String mapRoleString(Role role) {
        return role != null ? role.getName() : null;
    }
}
