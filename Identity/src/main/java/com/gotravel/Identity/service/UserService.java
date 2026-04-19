package com.gotravel.Identity.service;

import com.gotravel.Identity.dto.request.UserRequest;
import com.gotravel.Identity.dto.response.UserResponse;
import com.gotravel.Identity.mapper.UserMapper;
import com.gotravel.Identity.repository.RoleRepository;
import com.gotravel.Identity.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import com.gotravel.Identity.entity.User;
import com.gotravel.Identity.entity.Role;
import com.gotravel.Identity.entity.UserProfile;
import com.gotravel.Identity.entity.HostProfile;
import com.gotravel.Identity.entity.EnterpriseProfile;
import com.gotravel.Identity.enums.Provider;
import com.gotravel.Identity.dto.request.*;
import com.gotravel.Identity.dto.response.*;
import com.gotravel.Identity.exception.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class UserService {
    final UserRepository userRepository;
    final UserMapper userMapper;
    final RoleRepository roleRepository;

    /**
     * hàm sẽ set role mặc định là USER khi tạo tài khoản và setProvider Local
     * user thì phải set role và provider và isActive
     * userprofile thì phải set name số điện thoại
     *
     * @param userRequest
     * @return trả về Userresponse
     */
    public UserResponse createUser(UserRequest userRequest) {
        if (userRepository.existsByUsername(userRequest.getUsername())) {
            throw new AppException(UserErrorCode.USER_ALREADY_EXISTS);
        }
        if (userRequest.getEmail() != null && userRepository.existsByEmail(userRequest.getEmail())) {
            throw new AppException(UserErrorCode.EMAIL_ALREADY_EXISTS);
        }
        // mapper toàn bộ dữ liệu sang user
        User user = userMapper.userRequestToUser(userRequest);

        // set thêm các dữ liệu mặc định
        Role userRole = roleRepository.findById("USER")
                .orElseThrow(() -> new AppException(UserErrorCode.ROLE_NOT_FOUND));
        user.setRoles(new HashSet<>(Set.of(userRole)));
        user.setProvider(Provider.LOCAL);
        user.setIsActive(true);

        // set các chức năng còn lại vào Userprofile
        UserProfile userProfile = UserProfile.builder()
                .user(user)
                .fullName(userRequest.getFullName())
                .phoneNumber(userRequest.getPhoneNumber())
                .build();
        user.setUserProfile(userProfile);
        // lưu user
        userRepository.save(user);

        return userMapper.userToUserResponse(user);
    }

    /**
     *
     * @param username
     * @return
     */
    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));
        return userMapper.userToUserResponse(user);
    }

    /**
     *
     * @return list người dùng
     */
    public List<UserResponse> getAllUser() {
        return userRepository.findAll().stream()
                .map(userMapper::userToUserResponse)
                .toList();
    }


    /**
     *
     * @param username
     * @param userRequest
     * @return UserResponse
     */
    public UserResponse updateUser(String username, UserRequest userRequest) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));
        
        if (userRequest.getEmail() != null && !userRequest.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(userRequest.getEmail())) {
                throw new AppException(UserErrorCode.EMAIL_ALREADY_EXISTS);
            }
            user.setEmail(userRequest.getEmail());
        }

        userRepository.save(user);
        return userMapper.userToUserResponse(user);
    }


    /**
     *
     * @param username
     */
    public void deleteUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));
        userRepository.delete(user);
    }


    /**
     * @Note khi update role phải cần hỏi thêm về các thông tin và map thêm vào user cho từng hạng mục nữa .
     * @param username
     * @param roleName
     */
    public void upgradeToRole(String username, String roleName) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));
        Role role = roleRepository.findById(roleName.toUpperCase())
                .orElseThrow(() -> new AppException(UserErrorCode.ROLE_NOT_FOUND));

        user.getRoles().add(role);

        if (roleName.equalsIgnoreCase("HOST") && user.getHostProfile() == null) {
            HostProfile hostProfile = HostProfile.builder()
                    .user(user)
                    .build();
            user.setHostProfile(hostProfile);
        } else if (roleName.equalsIgnoreCase("ENTERPRISE") && user.getEnterpriseProfile() == null) {
            EnterpriseProfile enterpriseProfile = EnterpriseProfile.builder()
                    .user(user)
                    .build();
            user.setEnterpriseProfile(enterpriseProfile);
        }

        userRepository.save(user);
    }


    public UserResponse upgradeToHost(String username, HostProfileRequest hostProfileRequest) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));
        Role role = roleRepository.findById("HOST")
                .orElseThrow(() -> new AppException(UserErrorCode.ROLE_NOT_FOUND));

        user.getRoles().add(role);

        if (user.getHostProfile() == null) {
            HostProfile hostProfile = HostProfile.builder()
                    .user(user)
                    .build();
            user.setHostProfile(hostProfile);
        }
        
        userMapper.updateHostProfileFromRequest(hostProfileRequest, user.getHostProfile());
        userRepository.save(user);
        return userMapper.userToUserResponse(user);
    }


    public UserResponse upgradeToEnterprise(String username, EnterpriseProfileRequest enterpriseProfileRequest) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));
        Role role = roleRepository.findById("ENTERPRISE")
                .orElseThrow(() -> new AppException(UserErrorCode.ROLE_NOT_FOUND));

        user.getRoles().add(role);

        if (user.getEnterpriseProfile() == null) {
            EnterpriseProfile enterpriseProfile = EnterpriseProfile.builder()
                    .user(user)
                    .build();
            user.setEnterpriseProfile(enterpriseProfile);
        }

        userMapper.updateEnterpriseProfileFromRequest(enterpriseProfileRequest, user.getEnterpriseProfile());

        userRepository.save(user);
        return userMapper.userToUserResponse(user);
    }

    public UserProfileResponse getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));
        return userMapper.toUserProfileResponse(user.getUserProfile());
    }

    public UserProfileResponse updateUserProfile(String username, UserProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));
        if (user.getUserProfile() == null) {
            user.setUserProfile(UserProfile.builder().user(user).build());
        }
        userMapper.updateUserProfileFromRequest(request, user.getUserProfile());
        userRepository.save(user);
        return userMapper.toUserProfileResponse(user.getUserProfile());
    }

    public HostProfileResponse getHostProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));
        if (user.getHostProfile() == null) {
            throw new AppException(HostErrorCode.HOST_PROFILE_NOT_FOUND);
        }
        return userMapper.toHostProfileResponse(user.getHostProfile());
    }

    public HostProfileResponse updateHostProfile(String username, HostProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));
        if (user.getHostProfile() == null) {
            throw new AppException(HostErrorCode.USER_NOT_HOST);
        }
        userMapper.updateHostProfileFromRequest(request, user.getHostProfile());
        userRepository.save(user);
        return userMapper.toHostProfileResponse(user.getHostProfile());
    }

    public EnterpriseProfileResponse getEnterpriseProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));
        if (user.getEnterpriseProfile() == null) {
            throw new AppException(EnterpriseErrorCode.ENTERPRISE_PROFILE_NOT_FOUND);
        }
        return userMapper.toEnterpriseProfileResponse(user.getEnterpriseProfile());
    }

    public EnterpriseProfileResponse updateEnterpriseProfile(String username, EnterpriseProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));
        if (user.getEnterpriseProfile() == null) {
            throw new AppException(EnterpriseErrorCode.USER_NOT_ENTERPRISE);
        }
        userMapper.updateEnterpriseProfileFromRequest(request, user.getEnterpriseProfile());
        userRepository.save(user);
        return userMapper.toEnterpriseProfileResponse(user.getEnterpriseProfile());
    }
}
