package com.gotravel.Identity.controller;

import com.gotravel.Identity.dto.request.*;
import com.gotravel.Identity.dto.response.*;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.gotravel.Identity.service.UserService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserController {

    UserService userService;



    @PostMapping
    public ApiRequest<UserResponse> createUser(@RequestBody @Valid UserRequest user) {
        return ApiRequest.<UserResponse>builder()
                .success(true)
                .code("USER_CREATED_SUCCESS")
                .data(userService.createUser(user))
                .message("User created successfully")
                .build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiRequest<PageResponse<UserResponse>> getAllUser(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "ACTIVE") String status) {
        return ApiRequest.<PageResponse<UserResponse>>builder()
                .success(true)
                .message("Success")
                .code("GET_USERS_SUCCESS")
                .data(userService.getAllUsers(page, size, status))
                .build();
    }

    @GetMapping("/hosts")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiRequest<PageResponse<UserResponse>> getAllHostPending(
            @RequestParam(defaultValue = "PENDING") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiRequest.<PageResponse<UserResponse>>builder()
                .success(true)
                .message("Success")
                .code("GET_HOSTS_SUCCESS")
                .data(userService.getHostsByStatus(page, size, status))
                .build();
    }

    @GetMapping("/hosts/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiRequest<PageResponse<UserResponse>> getAllHosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiRequest.<PageResponse<UserResponse>>builder()
                .success(true)
                .message("Success")
                .code("GET_ALL_HOSTS_SUCCESS")
                .data(userService.getAllHosts(page, size))
                .build();
    }


    @GetMapping("/hosts/{accountId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiRequest<HostDetailResponse> getHostDetail(@PathVariable String accountId) {
        return ApiRequest.<HostDetailResponse>builder()
                .success(true)
                .message("Success")
                .data(userService.getHostDetail(accountId))
                .build();
    }

    @PutMapping("/{accountId}/approvalstatus")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiRequest<Void> approvalHostStatus(
            @RequestParam String type,
            @PathVariable String accountId,
            @RequestBody ApprovalRequest request) {
        userService.approvalHostStatus(accountId,type, request );
        return ApiRequest.<Void>builder()
                .success(true)
                .message("Đã cập nhật trạng thái phê duyệt thành " + request.getStatus())
                .code("APPROVAL_HOST_SUCCESS")
                .build();
    }

    @PutMapping("/accounts/{accountId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiRequest<Void> updateBanAccountStatus(
            @PathVariable String accountId,
            @RequestBody AccountStatusRequest request) {
        userService.updateBanAccountStatus(accountId, request);
        String message = "BANNED".equalsIgnoreCase(request.getStatus()) ? "Đã khóa tài khoản thành công" : "Đã mở khóa tài khoản thành công";
        return ApiRequest.<Void>builder()
                .success(true)
                .message(message)
                .code("UPDATE_ACCOUNT_STATUS_SUCCESS")
                .build();
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER')")
    public ApiRequest<UserResponse> getMyInfo() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info(SecurityContextHolder.getContext().getAuthentication().toString());
        return ApiRequest.<UserResponse>builder()
                .success(true)
                .data(userService.getUserById(userId))
                .build();
    }

    @PutMapping("/me")
    @PreAuthorize("hasAnyRole('USER')")
    public ApiRequest<UserResponse> updateMyInfo(@RequestBody UserUpdateRequest userUpdateRequest) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiRequest.<UserResponse>builder()
                .success(true)
                .data(userService.updateUser(userId, userUpdateRequest))
                .message("User updated successfully")
                .build();
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiRequest<Void> deleteAccount(@PathVariable String id) {
        userService.deleteUser(id);
        return ApiRequest.<Void>builder()
                .success(true)
                .message("User deleted successfully")
                .build();
    }

    @PatchMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public  ApiRequest<Void> banAccount(@PathVariable String id){
        userService.banUser(id);
        return ApiRequest.<Void>builder()
                .success(true)
                .message("User Banned successfully")
                .build();
    }

    @PostMapping("/{id}/upgraderole")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiRequest<String> upgradeRole(@PathVariable String id,@RequestParam String role) {
        userService.upgradeToRole(id, role);
        return ApiRequest.<String>builder()
                .success(true)
                .message("Role upgraded successfully")
                .data(role)
                .build();
    }

    @PostMapping("/me/upgradetohost")
    @PreAuthorize("hasAnyRole('USER')")
    public ApiRequest<ApprovalStatusResponse> upgradeToHost(@RequestBody HostProfileRequest hostProfileRequest) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiRequest.<ApprovalStatusResponse>builder()
                .success(true)
                .message("Nộp hồ sơ thành công")
                .code("APPLICATION_SUBMITTED_SUCCESSFULLY")
                .data(userService.upgradeToHost(userId, hostProfileRequest))
                .build();
    }



    @DeleteMapping("/me/upgradetohost")
    @PreAuthorize("hasAnyRole('USER')")
    public ApiRequest<ApprovalStatusResponse> deleteProfileUpgradeToHost() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        userService.deleteProfileUpgradeToHost(userId);
        return ApiRequest.<ApprovalStatusResponse>builder()
                .success(true)
                .message("Xoá hồ sơ thành công")
                .code("DELETE_SUCCESSFULLY")
                .build();
    }


    @PostMapping("/{id}/successupgradetohost")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ApiRequest<UserResponse> successUpgradeToHost(@PathVariable String id) {
        Boolean check = userService.successUpgradeToHost(id);
        return ApiRequest.<UserResponse>builder()
                .success(check)
                .message("Upgraded to HOST successfully")
                .build();
    }

    @PostMapping("/me/upgradetoenterprise")
    @PreAuthorize("hasAnyRole('USER')")
    public ApiRequest<UserResponse> upgradeToEnterprise(@RequestBody EnterpriseProfileRequest enterpriseProfileRequest) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiRequest.<UserResponse>builder()
                .success(true)
                .message("Upgraded to ENTERPRISE successfully")
                .data(userService.upgradeToEnterprise(userId, enterpriseProfileRequest))
                .build();
    }


    @GetMapping("/me/profile")
    @PreAuthorize("hasAnyRole('USER')")
    public ApiRequest<UserProfileResponse> getMyProfile() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiRequest.<UserProfileResponse>builder()
                .success(true)
                .data(userService.getUserProfile(userId))
                .build();
    }

    @PutMapping("/me/profile")
    @PreAuthorize("hasAnyRole('USER')")
    public ApiRequest<UserProfileResponse> updateMyProfile(@RequestBody UserProfileRequest dto) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiRequest.<UserProfileResponse>builder()
                .success(true)
                .data(userService.updateUserProfile(userId, dto))
                .build();
    }

    @GetMapping("/me/host-profile")
    @PreAuthorize("hasAnyRole('HOST')")
    public ApiRequest<HostProfileResponse> getMyHostProfile() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiRequest.<HostProfileResponse>builder()
                .success(true)
                .data(userService.getHostProfile(userId))
                .build();
    }

    @PutMapping("/me/host-profile")
    @PreAuthorize("hasAnyRole('HOST')")
    public ApiRequest<HostProfileResponse> updateMyHostProfile(@RequestBody HostProfileRequest dto) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiRequest.<HostProfileResponse>builder()
                .success(true)
                .data(userService.updateHostProfile(userId, dto))
                .build();
    }

    @GetMapping("/me/enterprise-profile")
    @PreAuthorize("hasAnyRole('ENTERPRISE')")
    public ApiRequest<EnterpriseProfileResponse> getMyEnterpriseProfile() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiRequest.<EnterpriseProfileResponse>builder()
                .success(true)
                .data(userService.getEnterpriseProfile(userId))
                .build();
    }

    @PutMapping("/me/enterprise-profile")
    @PreAuthorize("hasAnyRole('ENTERPRISE')")
    public ApiRequest<EnterpriseProfileResponse> updateMyEnterpriseProfile(@RequestBody EnterpriseProfileRequest dto) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiRequest.<EnterpriseProfileResponse>builder()
                .success(true)
                .data(userService.updateEnterpriseProfile(userId, dto))
                .build();
    }

    // Endpoint: GET /api/users/internal/{userId}/status
    @GetMapping("/internal/{userId}/status")
    public ApiRequest<UserStatusResponese> checkUserStatus(@PathVariable String userId) {
        UserStatusResponese statusResponese = userService.checkUserStatus(userId);
        return ApiRequest.<UserStatusResponese>builder()
                .success(true)
                .data(statusResponese)
                .message("User status retrieved successfully")
                .build();
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('USER', 'HOST', 'ENTERPRISE')")
    public ApiRequest<UserProfileResponse> uploadAvatar(@RequestParam("file") MultipartFile file) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        UserProfileResponse response = userService.uploadAvatar(userId, file);

        return ApiRequest.<UserProfileResponse>builder()
                .success(true)
                .data(response)
                .build();
    }
}
