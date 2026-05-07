package com.gotravel.Identity.service;

import com.gotravel.Identity.enums.Approval_status;
import com.gotravel.Identity.mapper.UserMapper;
import com.gotravel.Identity.repository.RoleRepository;
import com.gotravel.Identity.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
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
import java.util.UUID;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class UserService {
    final UserRepository userRepository;
    final UserMapper userMapper;
    final RoleRepository roleRepository;

    final PasswordEncoder passwordEncoder;
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
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
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
     * logic lấy user từ userId
     * @param userId
     * @return UserReponse
     */
    public UserResponse getUserById(String userId) {
        User user = userRepository.findById(userId)
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
     *  update user 
     * @param userId
     * @param userUpdateRequest
     * @return UserResponse
     */
    public UserResponse updateUser(String userId, UserUpdateRequest userUpdateRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));
        
        if(userUpdateRequest.getPassword() != null || !userUpdateRequest.getPassword().isEmpty() ) {
            user.setPassword(passwordEncoder.encode(userUpdateRequest.getPassword()));
        }
        user.setPassword(userUpdateRequest.getPassword());
        UserProfile userProfile = user.getUserProfile();
        if (userProfile == null) {
            userProfile = UserProfile.builder().user(user).build();
            user.setUserProfile(userProfile);
        }
        if (userUpdateRequest.getFullName() != null && !userUpdateRequest.getFullName().trim().isEmpty()) {
            userProfile.setFullName(userUpdateRequest.getFullName());
        }

        if (userUpdateRequest.getPhoneNumber() != null && !userUpdateRequest.getPhoneNumber().trim().isEmpty()) {
            userProfile.setPhoneNumber(userUpdateRequest.getPhoneNumber());
        }
        userRepository.save(user);
        return userMapper.userToUserResponse(user);
    }


    /**
     * @Logic tìm người dùng theo userId và xoá người dùng
     * @param userId
     */
    public void deleteUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));
        user.setIsDeleted(true);
        userRepository.save(user);
    }


    /**
     * @Note khi update role phải cần hỏi thêm về các thông tin và map thêm vào user cho từng hạng mục nữa .
     * @param userId
     * @param roleName
     */
    public void upgradeToRole(String userId, String roleName) {
        User user = userRepository.findById(userId)
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

    /**
     * @Logic upgrade từ người dùng lên Host 
     * @param userId
     * @param hostProfileRequest
     * @retuhostn UserReponse
     */
    public UserResponse upgradeToHost(String userId, HostProfileRequest hostProfileRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));
        if (user.getHostProfile() == null) {
            HostProfile hostProfile = HostProfile.builder()
                    .user(user)
                    .approvalStatus(Approval_status.PENDING)
                    .build();
            user.setHostProfile(hostProfile);
        }
        
        userMapper.updateHostProfileFromRequest(hostProfileRequest, user.getHostProfile());
        userRepository.save(user);
        return userMapper.userToUserResponse(user);
    }

    public boolean successUpgradeToHost(String userId){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));
        Role role = roleRepository.findById("HOST")
                .orElseThrow(() -> new AppException(UserErrorCode.ROLE_NOT_FOUND));

        user.getRoles().add(role);
        return true;
    }

    /**
     * @Logic upgrade từ người dùng lên  enterprise
     * @param userId
     * @retuhostn UserReponse
     */
    public UserResponse upgradeToEnterprise(String userId, EnterpriseProfileRequest enterpriseProfileRequest) {
        User user = userRepository.findById(userId)
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

    /**
     * @Logic lấy profile của user 
     * @param userId
     * @return UserProfileResponse
     */
    public UserProfileResponse getUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));
        return userMapper.toUserProfileResponse(user.getUserProfile());
    }

    /**
     * @Logic lấy userId và request để cập nhật userprofilereponse 
     * @param userId
     * @param request
     * @return UserProfileResponse
     */
    public UserProfileResponse updateUserProfile(String userId, UserProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));
        if (user.getUserProfile() == null) {
            user.setUserProfile(UserProfile.builder().user(user).build());
        }
        userMapper.updateUserProfileFromRequest(request, user.getUserProfile());
        userRepository.save(user);
        return userMapper.toUserProfileResponse(user.getUserProfile());
    }

    /**
     * 
     * @param userId
     * @return HostProfileResponse
     */
    public HostProfileResponse getHostProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));
        if (user.getHostProfile() == null) {
            throw new AppException(HostErrorCode.HOST_PROFILE_NOT_FOUND);
        }
        return userMapper.toHostProfileResponse(user.getHostProfile());
    }

    /**
     *
     * @param userId
     * @param request
     * @return HostProfileResponse
     */
    public HostProfileResponse updateHostProfile(String userId, HostProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));
        if (user.getHostProfile() == null) {
            throw new AppException(HostErrorCode.USER_NOT_HOST);
        }
        userMapper.updateHostProfileFromRequest(request, user.getHostProfile());
        userRepository.save(user);
        return userMapper.toHostProfileResponse(user.getHostProfile());
    }

    /**
     *
     * @param userId
     * @return EnterpriseProfileResponse
     */
    public EnterpriseProfileResponse getEnterpriseProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));
        if (user.getEnterpriseProfile() == null) {
            throw new AppException(EnterpriseErrorCode.ENTERPRISE_PROFILE_NOT_FOUND);
        }
        return userMapper.toEnterpriseProfileResponse(user.getEnterpriseProfile());
    }

    /**
     *
     * @param userId
     * @param request
     * @return EnterpriseProfileResponse
     */
    public EnterpriseProfileResponse updateEnterpriseProfile(String userId, EnterpriseProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));
        if (user.getEnterpriseProfile() == null) {
            throw new AppException(EnterpriseErrorCode.USER_NOT_ENTERPRISE);
        }
        userMapper.updateEnterpriseProfileFromRequest(request, user.getEnterpriseProfile());
        userRepository.save(user);
        return userMapper.toEnterpriseProfileResponse(user.getEnterpriseProfile());
    }

    /**
     * @Logic Dùng để kiểm tra trạng thái User sống hay là chết
     * @param userId
     * @return UserStatusResponse (chứa trạng thái isActive)
     */
    public UserStatusResponese checkUserStatus(String userId) {
        User user  = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));

        boolean isAllow = (user.getIsActive() !=null && user.getIsActive())
                && (user.getIsDeleted() !=null || !user.getIsDeleted());

        return  UserStatusResponese.builder()
                .isActive(isAllow)
                .build();

    }
}
