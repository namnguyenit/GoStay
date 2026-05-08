package com.gotravel.Identity.service;

import com.gotravel.Identity.enums.Approval_status;
import com.gotravel.Identity.mapper.UserMapper;
import com.gotravel.Identity.repository.HostProfileRepository;
import com.gotravel.Identity.repository.RoleRepository;
import com.gotravel.Identity.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class UserService {
    final UserRepository userRepository;
    final UserMapper userMapper;
    final RoleRepository roleRepository;
    final HostProfileRepository hostProfileRepository;
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
            throw new AppException(com.gotravel.Identity.exception.AppCode.USER_ALREADY_EXISTS);
        }
        if (userRequest.getEmail() != null && userRepository.existsByEmail(userRequest.getEmail())) {
            throw new AppException(com.gotravel.Identity.exception.AppCode.EMAIL_ALREADY_EXISTS);
        }
        // mapper toàn bộ dữ liệu sang user
        User user = userMapper.userRequestToUser(userRequest);
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        // set thêm các dữ liệu mặc định
        Role userRole = roleRepository.findById("USER")
                .orElseThrow(() -> new AppException(com.gotravel.Identity.exception.AppCode.ROLE_NOT_FOUND));
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
        User user = findUserById(userId);
        return userMapper.userToUserResponse(user);
    }

    /**
     *
     * @return list người dùng
     */
    public PageResponse<UserResponse> getAllUsers(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size);
        boolean isDeleted = "BANNED".equalsIgnoreCase(status);
        
        Page<User> userPage = userRepository.findAllByIsDeleted(isDeleted, pageable);
        
        return PageResponse.<UserResponse>builder()
                .content(userPage.getContent().stream().map(userMapper::userToUserResponse).toList())
                .totalPages(userPage.getTotalPages())
                .totalElements(userPage.getTotalElements())
                .build();
    }


    /**
     *  update user 
     * @param userId
     * @param userUpdateRequest
     * @return UserResponse
     */
    public UserResponse updateUser(String userId, UserUpdateRequest userUpdateRequest) {
        User user = findUserById(userId);
        
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
        User user = findUserById(userId);
        user.setIsDeleted(true);
        userRepository.save(user);
    }


    /**
     * @Note khi update role phải cần hỏi thêm về các thông tin và map thêm vào user cho từng hạng mục nữa .
     * @param userId
     * @param roleName
     */
    public void upgradeToRole(String userId, String roleName) {
        User user = findUserById(userId);
        Role role = roleRepository.findById(roleName.toUpperCase())
                .orElseThrow(() -> new AppException(com.gotravel.Identity.exception.AppCode.ROLE_NOT_FOUND));

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
    public ApprovalStatusResponse upgradeToHost(String userId, HostProfileRequest hostProfileRequest) {
        User user = findUserById(userId);
        Boolean check = user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("HOST"));
        if(check){
            throw new AppException(UserErrorCode.ROLE_USER_ALREADY_EXISTS);
        }
        if(user.getHostProfile() != null){
            HostProfile hostProfile = user.getHostProfile();
            String appprovalstatus = String.valueOf(hostProfile.getApprovalStatus());
            if(appprovalstatus != "APPROVED"){
                throw new AppException(UserErrorCode.POFILE_USER_AWAITING_EXISTS);
            }

        }

        if (user.getHostProfile() == null) {
            HostProfile hostProfile = HostProfile.builder()
                    .user(user)
                    .approvalStatus(Approval_status.PENDING)
                    .build();
            user.setHostProfile(hostProfile);
        }
        
        userMapper.updateHostProfileFromRequest(hostProfileRequest, user.getHostProfile());
        userRepository.save(user);
        return ApprovalStatusResponse
                .builder()
                .approvalstatus("PENDING")
                .build();
    }

    /**
     * @Logic upgrade từ người dùng lên Host
     * @param userId
     * @param hostProfileRequest
     * @retuhostn UserReponse
     */
    public ApprovalStatusResponse updateProfileUpgradeToHost(String userId, HostProfileRequest hostProfileRequest) {
        User user = findUserById(userId);
        Boolean check = user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("HOST"));
        if(check){
            throw new AppException(UserErrorCode.ROLE_USER_ALREADY_EXISTS);
        }
        if(user.getHostProfile() == null){
            throw  new AppException(HostErrorCode.HOST_PROFILE_NOT_EXIST);
        }

        if(user.getHostProfile() != null){
            HostProfile hostProfile = user.getHostProfile();
            String appprovalstatus = String.valueOf(hostProfile.getApprovalStatus());
            if(appprovalstatus != "APPROVED"){
                throw new AppException(UserErrorCode.POFILE_USER_AWAITING_EXISTS);
            }
        }

        HostProfile hostProfile = HostProfile.builder()
                .user(user)
                .build();
        user.setHostProfile(hostProfile);


        userMapper.updateHostProfileFromRequest(hostProfileRequest, user.getHostProfile());
        userRepository.save(user);
        return ApprovalStatusResponse
                .builder()
                .approvalstatus("PENDING")
                .build();
    }

    public boolean deleteProfileUpgradeToHost(String userId){
        User user = findUserById(userId);

        if(user.getHostProfile() == null){
            throw new AppException(HostErrorCode.HOST_PROFILE_NOT_EXIST);
        }

        user.getHostProfile().setApprovalStatus(Approval_status.REJECTED);
        userRepository.save(user);
        return true;
    }

    public HostDetailResponse getHostDetail(String userId) {
        User user = findUserById(userId);
        HostProfile hostProfile = user.getHostProfile();
        if (hostProfile == null) {
            throw new AppException(HostErrorCode.HOST_PROFILE_NOT_EXIST);
        }

        String hostType = user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ENTERPRISE")) ? "ENTERPRISE" : "PERSONAL";

        return HostDetailResponse.builder()
                .accountId(user.getId())
                .fullName(hostProfile.getFullName())
                .hostType(hostType)
                .approvalStatus(hostProfile.getApprovalStatus().toString())
                .identityInfo(HostDetailResponse.IdentityInfo.builder()
                        .taxCode(hostProfile.getTaxCode())
                        .frontImageUrl(hostProfile.getFrontImageUrl())
                        .backImageUrl(hostProfile.getBackImageUrl())
                        .build())
                .build();
    }

    public PageResponse<UserResponse> getHostsByStatus(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size);
        Approval_status approvalStatus = Approval_status.valueOf(status.toUpperCase());

        Page<HostProfile> hostPage = hostProfileRepository.findAllByApprovalStatus(approvalStatus, pageable);

        return PageResponse.<UserResponse>builder()
                .content(hostPage.getContent().stream().map(hp -> userMapper.userToUserResponse(hp.getUser())).toList())
                .totalPages(hostPage.getTotalPages())
                .totalElements(hostPage.getTotalElements())
                .build();
    }

    public PageResponse<UserResponse> getAllHosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<HostProfile> hostPage = hostProfileRepository.findAll(pageable);

        return PageResponse.<UserResponse>builder()
                .content(hostPage.getContent().stream().map(hp -> userMapper.userToUserResponse(hp.getUser())).toList())
                .totalPages(hostPage.getTotalPages())
                .totalElements(hostPage.getTotalElements())
                .build();
    }

    public Boolean approvalHostStatus(String userId, ApprovalRequest request) {
        User user = findUserById(userId);
        HostProfile hostProfile = user.getHostProfile();
        if (hostProfile == null) {
            throw new AppException(HostErrorCode.HOST_PROFILE_NOT_EXIST);
        }

        Approval_status status = Approval_status.valueOf(request.getStatus().toUpperCase());
        hostProfile.setApprovalStatus(status);
        
        // Có thể lưu reason vào database nếu Entity HostProfile có trường này
        // hostProfile.setReason(request.getReason());

        userRepository.save(user);
        return true;
    }

    public Boolean updateAccountStatus(String userId, AccountStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));
        
        boolean isBan = "BANNED".equalsIgnoreCase(request.getStatus());
        user.setIsDeleted(isBan);
        
        userRepository.save(user);
        return true;
    }

    public boolean successUpgradeToHost(String userId){
        User user = findUserById(userId);
        Role role = roleRepository.findById("HOST")
                .orElseThrow(() -> new AppException(com.gotravel.Identity.exception.AppCode.ROLE_NOT_FOUND));

        user.getRoles().add(role);
        return true;
    }

    /**
     * @Logic upgrade từ người dùng lên  enterprise
     * @param userId
     * @retuhostn UserReponse
     */
    public UserResponse upgradeToEnterprise(String userId, EnterpriseProfileRequest enterpriseProfileRequest) {
        User user = findUserById(userId);
        Role role = roleRepository.findById("ENTERPRISE")
                .orElseThrow(() -> new AppException(com.gotravel.Identity.exception.AppCode.ROLE_NOT_FOUND));

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
        User user = findUserById(userId);
        return userMapper.toUserProfileResponse(user.getUserProfile());
    }

    /**
     * @Logic lấy userId và request để cập nhật userprofilereponse 
     * @param userId
     * @param request
     * @return UserProfileResponse
     */
    public UserProfileResponse updateUserProfile(String userId, UserProfileRequest request) {
        User user = findUserById(userId);
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
        User user = findUserById(userId);
        if (user.getHostProfile() == null) {
            throw new AppException(com.gotravel.Identity.exception.AppCode.HOST_PROFILE_NOT_FOUND);
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
        User user = findUserById(userId);
        if (user.getHostProfile() == null) {
            throw new AppException(com.gotravel.Identity.exception.AppCode.USER_NOT_HOST);
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
        User user = findUserById(userId);
        if (user.getEnterpriseProfile() == null) {
            throw new AppException(com.gotravel.Identity.exception.AppCode.ENTERPRISE_PROFILE_NOT_FOUND);
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
        User user = findUserById(userId);
        if (user.getEnterpriseProfile() == null) {
            throw new AppException(com.gotravel.Identity.exception.AppCode.USER_NOT_ENTERPRISE);
        }
        userMapper.updateEnterpriseProfileFromRequest(request, user.getEnterpriseProfile());
        userRepository.save(user);
        return userMapper.toEnterpriseProfileResponse(user.getEnterpriseProfile());
    }

    /**
     * Helper method để tìm user và kiểm tra trạng thái (Active/Banned)
     * Giúp code trong service clean hơn và tránh lặp lại logic check ban.
     */
    private User findUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));

        if (Boolean.TRUE.equals(user.getIsDeleted())) {
            throw new AppException(UserErrorCode.BANED_USER);
        }

        return user;
    }

    public UserStatusResponese checkUserStatus(String userId) {
        User user  = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(com.gotravel.Identity.exception.AppCode.USER_NOT_FOUND));

        boolean isAllow = (user.getIsActive() !=null && user.getIsActive())
                && (user.getIsDeleted() !=null || !user.getIsDeleted());

        return  UserStatusResponese.builder()
                .isActive(isAllow)
                .build();

    }
}
