package com.gotravel.Identity.controller;

import com.gotravel.Identity.dto.request.ApiRequest;
import com.gotravel.Identity.dto.request.UserRequest;
import com.gotravel.Identity.dto.request.*;
import com.gotravel.Identity.dto.response.*;
import com.gotravel.Identity.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
                .data(userService.createUser(user))
                .message("User created successfully")
                .build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiRequest<List<UserResponse>> getAllUser() {
        return ApiRequest.<List<UserResponse>>builder()
                .success(true)
                .data(userService.getAllUser())
                .build();
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER')")
    public ApiRequest<UserResponse> getMyInfo() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info(SecurityContextHolder.getContext().getAuthentication().toString());
        return ApiRequest.<UserResponse>builder()
                .success(true)
                .data(userService.getUserByUsername(username))
                .build();
    }

    @PutMapping("/me")
    @PreAuthorize("hasAnyRole('USER')")
    public ApiRequest<UserResponse> updateMyInfo(@RequestBody UserRequest userRequest) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiRequest.<UserResponse>builder()
                .success(true)
                .data(userService.updateUser(username, userRequest))
                .message("User updated successfully")
                .build();
    }

    @DeleteMapping("/me")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiRequest<Void> deleteMyAccount() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        userService.deleteUser(username);
        return ApiRequest.<Void>builder()
                .success(true)
                .message("User deleted successfully")
                .build();
    }


    @PostMapping("/me/upgrade-role")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiRequest<String> upgradeMyRole(@RequestParam String role) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        userService.upgradeToRole(username, role);
        return ApiRequest.<String>builder()
                .success(true)
                .message("Role upgraded successfully")
                .data(role)
                .build();
    }

    @PostMapping("/me/upgradetohost")
    @PreAuthorize("hasAnyRole('USER')")
    public ApiRequest<UserResponse> upgradeToHost(@RequestBody HostProfileRequest hostProfileRequest) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiRequest.<UserResponse>builder()
                .success(true)
                .message("Upgraded to HOST successfully")
                .data(userService.upgradeToHost(username, hostProfileRequest))
                .build();
    }

    @PostMapping("/me/upgradetoenterprise")
    @PreAuthorize("hasAnyRole('USER')")
    public ApiRequest<UserResponse> upgradeToEnterprise(@RequestBody EnterpriseProfileRequest enterpriseProfileRequest) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiRequest.<UserResponse>builder()
                .success(true)
                .message("Upgraded to ENTERPRISE successfully")
                .data(userService.upgradeToEnterprise(username, enterpriseProfileRequest))
                .build();
    }


    @GetMapping("/me/profile")
    @PreAuthorize("hasAnyRole('USER')")
    public ApiRequest<UserProfileResponse> getMyProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiRequest.<UserProfileResponse>builder()
                .success(true)
                .data(userService.getUserProfile(username))
                .build();
    }

    @PutMapping("/me/profile")
    @PreAuthorize("hasAnyRole('USER')")
    public ApiRequest<UserProfileResponse> updateMyProfile(@RequestBody UserProfileRequest dto) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiRequest.<UserProfileResponse>builder()
                .success(true)
                .data(userService.updateUserProfile(username, dto))
                .build();
    }

    @GetMapping("/me/host-profile")
    @PreAuthorize("hasAnyRole('HOST')")
    public ApiRequest<HostProfileResponse> getMyHostProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiRequest.<HostProfileResponse>builder()
                .success(true)
                .data(userService.getHostProfile(username))
                .build();
    }

    @PutMapping("/me/host-profile")
    @PreAuthorize("hasAnyRole('HOST')")
    public ApiRequest<HostProfileResponse> updateMyHostProfile(@RequestBody HostProfileRequest dto) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiRequest.<HostProfileResponse>builder()
                .success(true)
                .data(userService.updateHostProfile(username, dto))
                .build();
    }

    @GetMapping("/me/enterprise-profile")
    @PreAuthorize("hasAnyRole('ENTERPRISE')")
    public ApiRequest<EnterpriseProfileResponse> getMyEnterpriseProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiRequest.<EnterpriseProfileResponse>builder()
                .success(true)
                .data(userService.getEnterpriseProfile(username))
                .build();
    }

    @PutMapping("/me/enterprise-profile")
    @PreAuthorize("hasAnyRole('ENTERPRISE')")
    public ApiRequest<EnterpriseProfileResponse> updateMyEnterpriseProfile(@RequestBody EnterpriseProfileRequest dto) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiRequest.<EnterpriseProfileResponse>builder()
                .success(true)
                .data(userService.updateEnterpriseProfile(username, dto))
                .build();
    }
}
