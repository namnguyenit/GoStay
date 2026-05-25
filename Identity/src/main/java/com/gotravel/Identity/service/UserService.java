package com.gotravel.Identity.service;

import com.gotravel.Identity.enums.Approval_status;
import com.gotravel.Identity.mapper.UserMapper;
import com.gotravel.Identity.repository.HostProfileRepository;
import com.gotravel.Identity.repository.RoleRepository;
import com.gotravel.Identity.repository.UserRepository;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.PersistenceUnit;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
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
import java.security.PublicKey;
import java.util.*;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

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
    @Transactional
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
        User user = findUserById(userId);
        return userMapper.userToUserResponse(user);
    }

    /**
     * lấy cả người dùng bị ban hay bị xoá
     * @return list người dùng
     */
    public PageResponse<UserResponse> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage = userRepository.findAllByRoles_Name("USER",pageable);

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
    @Transactional
    public UserResponse updateUser(String userId, UserUpdateRequest userUpdateRequest) {
        User user = findUserById(userId);

        if(userUpdateRequest.getPassword() != null && !userUpdateRequest.getPassword().isEmpty() ) {
            user.setPassword(passwordEncoder.encode(userUpdateRequest.getPassword()));
        }
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
    @Transactional
    public void deleteUser(String userId) {
        User user = findUserById(userId);
        user.setIsDeleted(true);
        user.setIsActive(false);
        userRepository.save(user);
    }

    @Transactional
    public void banUser(String userId) {
        User user = findUserById(userId);
        user.setIsActive(false);
        userRepository.save(user);
    }


    /**
     * @Note khi update role phải cần hỏi thêm về các thông tin và map thêm vào user cho từng hạng mục nữa .
     * @param userId
     * @param roleName
     */
    @Transactional
    public void upgradeToRole(String userId, String roleName) {
        User user = findUserById(userId);
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
    @Transactional
    public ApprovalStatusResponse upgradeToHost(
            String userId,
            HostProfileRequest hostProfileRequest,
            MultipartFile frontImage,
            MultipartFile backImage) {
        User user = findUserById(userId);
        Boolean check = user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("HOST"));
        if(check){
            throw new AppException(UserErrorCode.ROLE_USER_ALREADY_EXISTS);
        }
        if(user.getHostProfile() != null){
            HostProfile hostProfile = user.getHostProfile();
            String appprovalstatus = String.valueOf(hostProfile.getApprovalStatus());
            if(!appprovalstatus.equals("APPROVED")){
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
        List<String> documentUrls = uploadSecureDocuments(userId, frontImage, backImage);
        user.getHostProfile().setFrontImageUrl(documentUrls.get(0));
        user.getHostProfile().setBackImageUrl(documentUrls.get(1));
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
    @Transactional
    public ApprovalStatusResponse updateProfileUpgradeToHost(String userId, HostProfileRequest hostProfileRequest) {
        User user = findUserById(userId);
        Boolean check = user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("HOST"));
        if(check){
            throw new AppException(UserErrorCode.ROLE_USER_ALREADY_EXISTS);
        }
        HostProfile existingProfile = user.getHostProfile();
        if(existingProfile == null){
            throw new AppException(HostErrorCode.HOST_PROFILE_NOT_EXIST);
        }

        if(existingProfile.getApprovalStatus() == Approval_status.APPROVED){
            throw new AppException(UserErrorCode.POFILE_USER_AWAITING_EXISTS);
        }

        userMapper.updateHostProfileFromRequest(hostProfileRequest, existingProfile);


        existingProfile.setApprovalStatus(Approval_status.PENDING);
        userRepository.save(user);
        return ApprovalStatusResponse
                .builder()
                .approvalstatus("PENDING")
                .build();
    }

    @Transactional
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
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));
        HostProfile hostProfile = user.getHostProfile();
        if (hostProfile == null) {
            throw new AppException(HostErrorCode.HOST_PROFILE_NOT_EXIST);
        }

        String hostType = user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ENTERPRISE")) ? "ENTERPRISE" : "PERSONAL";

        return HostDetailResponse.builder()
                .accountId(user.getId())
                .fullName(hostProfile.getFullName())
                .avatarUrl(getAvatarUrl(user))
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

    @Transactional
    public Boolean approvalHostStatus(String userId,String type, ApprovalRequest request) {
        User user = findUserById(userId);
        if(type.equals(com.gotravel.Identity.enums.Role.HOST.toString())){
            HostProfile hostProfile = user.getHostProfile();
            if (hostProfile == null) {
                throw new AppException(HostErrorCode.HOST_PROFILE_NOT_EXIST);
            }
            Approval_status status = Approval_status.valueOf(request.getStatus().toUpperCase());
            hostProfile.setApprovalStatus(status);
            userRepository.save(user);
        }else if(type.equals(com.gotravel.Identity.enums.Role.ENTERPRISE.toString())){
            EnterpriseProfile enterpriseProfile = user.getEnterpriseProfile();
            if(enterpriseProfile == null){
                throw new AppException(EnterpriseErrorCode.ENTERPRISE_PROFILE_NOT_EXIST);
            }
            Approval_status status = Approval_status.valueOf(request.getStatus().toUpperCase());
            enterpriseProfile.setApprovalStatus(status);
            userRepository.save(user);
        }
        return true;
    }


    @Transactional
    public Boolean updateBanAccountStatus(String userId, AccountStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));

        boolean isActive = !"BANNED".equalsIgnoreCase(request.getStatus());
        user.setIsActive(isActive);

        userRepository.save(user);
        return true;
    }

    @Transactional
    public boolean successUpgradeToHost(String userId){
        User user = findUserById(userId);
        Role role = roleRepository.findById("HOST")
                .orElseThrow(() -> new AppException(UserErrorCode.ROLE_NOT_FOUND));

        user.getRoles().add(role);
        userRepository.save(user);
        return true;
    }

    /**
     * @Logic upgrade từ người dùng lên  enterprise
     * @param userId
     * @retuhostn UserReponse
     */
    @Transactional
    public UserResponse upgradeToEnterprise(String userId, EnterpriseProfileRequest enterpriseProfileRequest) {
        User user = findUserById(userId);

        Boolean check = user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ENTERPRISE"));
        if(check){
            throw new AppException(UserErrorCode.ROLE_USER_ALREADY_EXISTS);
        }


        if(user.getEnterpriseProfile() != null){
            EnterpriseProfile enterpriseProfile = user.getEnterpriseProfile();
            String appprovalstatus = String.valueOf(enterpriseProfile.getApprovalStatus());
            if(appprovalstatus.equals("APPROVED")){
                throw new AppException(UserErrorCode.POFILE_USER_AWAITING_EXISTS);
            }
        }

        if (user.getEnterpriseProfile() == null) {
            EnterpriseProfile enterpriseProfile = EnterpriseProfile.builder()
                    .user(user)
                    .approvalStatus(Approval_status.PENDING)
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
    @Transactional
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
            throw new AppException(HostErrorCode.HOST_PROFILE_NOT_FOUND);
        }
        HostProfileResponse response = userMapper.toHostProfileResponse(user.getHostProfile());
        response.setAvatarUrl(getAvatarUrl(user));
        return response;
    }

    /**
     *
     * @param userId
     * @param request
     * @return HostProfileResponse
     */
    @Transactional
    public HostProfileResponse updateHostProfile(String userId, HostProfileRequest request) {
        User user = findUserById(userId);
        if (user.getHostProfile() == null) {
            throw new AppException(HostErrorCode.USER_NOT_HOST);
        }
        userMapper.updateHostProfileFromRequest(request, user.getHostProfile());
        userRepository.save(user);
        HostProfileResponse response = userMapper.toHostProfileResponse(user.getHostProfile());
        response.setAvatarUrl(getAvatarUrl(user));
        return response;
    }

    /**
     *
     * @param userId
     * @return EnterpriseProfileResponse
     */
    public EnterpriseProfileResponse getEnterpriseProfile(String userId) {
        User user = findUserById(userId);
        if (user.getEnterpriseProfile() == null) {
            throw new AppException(EnterpriseErrorCode.ENTERPRISE_PROFILE_NOT_FOUND);
        }
        EnterpriseProfileResponse response = userMapper.toEnterpriseProfileResponse(user.getEnterpriseProfile());
        response.setAvatarUrl(getAvatarUrl(user));
        return response;
    }

    /**
     *
     * @param userId
     * @param request
     * @return EnterpriseProfileResponse
     */
    @Transactional
    public EnterpriseProfileResponse updateEnterpriseProfile(String userId, EnterpriseProfileRequest request) {
        User user = findUserById(userId);
        if (user.getEnterpriseProfile() == null) {
            throw new AppException(EnterpriseErrorCode.USER_NOT_ENTERPRISE);
        }
        if(!user.getEnterpriseProfile().getApprovalStatus().equals(Approval_status.APPROVED))
            throw new AppException(UserErrorCode.POFILE_USER_AWAITING_EXISTS);

        userMapper.updateEnterpriseProfileFromRequest(request, user.getEnterpriseProfile());
        userRepository.save(user);
        EnterpriseProfileResponse response = userMapper.toEnterpriseProfileResponse(user.getEnterpriseProfile());
        response.setAvatarUrl(getAvatarUrl(user));
        return response;
    }

    private String getAvatarUrl(User user) {
        return user.getUserProfile() != null ? user.getUserProfile().getAvatarUrl() : null;
    }

    /**
     * Helper method để tìm user và kiểm tra trạng thái (Active/Banned)
     * Giúp code trong service clean hơn và tránh lặp lại logic check ban.
     */
    private User findUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));

        if (Boolean.TRUE.equals(user.getIsDeleted())) {
            throw new AppException(UserErrorCode.DELETE_USER);
        }

        if(Boolean.FALSE.equals(user.getIsActive())){
            throw new AppException(UserErrorCode.BANED_USER);
        }

        return user;
    }


    public UserStatusResponese checkUserStatus(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(UserErrorCode.USER_NOT_FOUND));
        boolean isActive = Boolean.TRUE.equals(user.getIsActive());
        boolean isDeleted = Boolean.TRUE.equals(user.getIsDeleted());

        return UserStatusResponese.builder()
                .isActive(isActive)
                .isDeleted(isDeleted)
                .isAllowed(isActive && !isDeleted)
                .build();
    }


    @Value("${media.service.url}")
    private String mediaServiceUrl;

    @Value("${media.service.token:}")
    private String mediaServiceToken;
/**
 * @Logic Nhận file từ FE, gọi sang Node.js upload Cloudinary, lưu URL vào DB
 */
    public UserProfileResponse uploadAvatar(String userId, MultipartFile file, String authorizationHeader){
        User user = findUserById(userId);
        try{
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.set(HttpHeaders.AUTHORIZATION, authorizationHeader);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            HttpHeaders fileHeaders = new HttpHeaders();
            if (file.getContentType() != null) {
                fileHeaders.setContentType(MediaType.parseMediaType(file.getContentType()));
            }
            
            org.springframework.core.io.ByteArrayResource fileResource = new org.springframework.core.io.ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename() != null ? file.getOriginalFilename() : "avatar.jpg";
                }
            };
            
            HttpEntity<org.springframework.core.io.ByteArrayResource> filePart = new HttpEntity<>(fileResource, fileHeaders);
            
            body.add("file", filePart);
            body.add("folder", "avatar");


            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.postForEntity(mediaServiceUrl, requestEntity, Map.class);


            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String ,Object> responseBody = response.getBody();
                Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
                String avatarUrl = (String) data.get("url");
                if(user.getUserProfile()==null){
                    user.setUserProfile(UserProfile.builder().user(user).build());
                }
                user.getUserProfile().setAvatarUrl(avatarUrl);
                userRepository.save(user);

                return userMapper.toUserProfileResponse(user.getUserProfile());
            }else {
                throw new AppException(UserErrorCode.UPLOAD_IMAGE_FAILED);
            }


        } catch (AppException e){
            throw e;
        } catch (Exception e) {
            throw new AppException(UserErrorCode.UPLOAD_IMAGE_FAILED);
        }
    }

    private List<String> uploadSecureDocuments(String userId, MultipartFile frontImage, MultipartFile backImage) {
        if (mediaServiceToken == null || mediaServiceToken.isBlank()) {
            throw new AppException(UserErrorCode.UPLOAD_IMAGE_FAILED);
        }
        if (frontImage == null || frontImage.isEmpty() || backImage == null || backImage.isEmpty()) {
            throw new AppException(UserErrorCode.UPLOAD_IMAGE_FAILED);
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.set("x-internal-service-token", mediaServiceToken);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("files", toFilePart(frontImage, "front-image.jpg"));
            body.add("files", toFilePart(backImage, "back-image.jpg"));
            body.add("folder", "host-applications/" + userId);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.postForEntity(getSecureMediaUploadUrl(), requestEntity, Map.class);

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                throw new AppException(UserErrorCode.UPLOAD_IMAGE_FAILED);
            }

            Map<String, Object> responseBody = response.getBody();
            Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
            List<?> urls = data != null ? (List<?>) data.get("urls") : null;

            if (urls == null || urls.size() < 2) {
                throw new AppException(UserErrorCode.UPLOAD_IMAGE_FAILED);
            }

            return List.of(String.valueOf(urls.get(0)), String.valueOf(urls.get(1)));
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(UserErrorCode.UPLOAD_IMAGE_FAILED);
        }
    }

    private HttpEntity<org.springframework.core.io.ByteArrayResource> toFilePart(MultipartFile file, String defaultFileName) throws java.io.IOException {
        HttpHeaders fileHeaders = new HttpHeaders();
        if (file.getContentType() != null) {
            fileHeaders.setContentType(MediaType.parseMediaType(file.getContentType()));
        }

        org.springframework.core.io.ByteArrayResource fileResource = new org.springframework.core.io.ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename() != null ? file.getOriginalFilename() : defaultFileName;
            }
        };

        return new HttpEntity<>(fileResource, fileHeaders);
    }

    private String getSecureMediaUploadUrl() {
        String uploadUrl = mediaServiceUrl.endsWith("/")
                ? mediaServiceUrl.substring(0, mediaServiceUrl.length() - 1)
                : mediaServiceUrl;

        if (uploadUrl.endsWith("/secure-documents")) {
            return uploadUrl;
        }

        return uploadUrl + "/secure-documents";
    }



}
