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
    public ApiRequest<List<UserResponse>> getAllUser() {
        return ApiRequest.<List<UserResponse>>builder()
                .success(true)
                .data(userService.getAllUser())
                .build();
    }

    @GetMapping("/{username}")
    public ApiRequest<UserResponse> getUser(@PathVariable String username) {
        return ApiRequest.<UserResponse>builder()
                .success(true)
                .data(userService.getUserByUsername(username))
                .build();
    }

    @PutMapping("/{username}")
    public ApiRequest<UserResponse> updateUser(@PathVariable String username, @RequestBody UserRequest userRequest) {
        return ApiRequest.<UserResponse>builder()
                .success(true)
                .data(userService.updateUser(username, userRequest))
                .message("User updated successfully")
                .build();
    }

    @DeleteMapping("/{username}")
    public ApiRequest<Void> deleteUser(@PathVariable String username) {
        userService.deleteUser(username);
        return ApiRequest.<Void>builder()
                .success(true)
                .message("User deleted successfully")
                .build();
    }


    @PostMapping("/{username}/upgrade-role")
    public ApiRequest<String> upgradeRole(@PathVariable String username, @RequestParam String role) {
        userService.upgradeToRole(username, role);
        return ApiRequest.<String>builder()
                .success(true)
                .message("Role upgraded successfully")
                .data(role)
                .build();
    }

    @PostMapping("/{username}/upgradetohost")
    public ApiRequest<HostProfileResponse> upgradeToHost(@PathVariable String username, @RequestBody HostProfileRequest hostProfileRequest) {

        return ApiRequest.<HostProfileResponse>builder()
                .success(true)
                .message("Role upgraded successfully")
                .data(userService.upgradeToHost(username, hostProfileRequest))
                .build();
    }

    @PostMapping("/{username}/upgradetoenterprise")
    public ApiRequest<EnterpriseProfileResponse> upgradeToHost(@PathVariable String username, @RequestBody EnterpriseProfileRequest enterpriseProfileRequest) {

        return ApiRequest.<EnterpriseProfileResponse>builder()
                .success(true)
                .message("Role upgraded successfully")
                .data(userService.upgradeToEnterprise(username, enterpriseProfileRequest))
                .build();
    }


    @GetMapping("/{username}/profile")
    public ApiRequest<UserProfileResponse> getUserProfile(@PathVariable String username) {
        return ApiRequest.<UserProfileResponse>builder()
                .success(true)
                .data(userService.getUserProfile(username))
                .build();
    }

    @PutMapping("/{username}/profile")
    public ApiRequest<UserProfileResponse> updateUserProfile(@PathVariable String username, @RequestBody UserProfileRequest dto) {
        return ApiRequest.<UserProfileResponse>builder()
                .success(true)
                .data(userService.updateUserProfile(username, dto))
                .build();
    }

    @GetMapping("/{username}/host-profile")
    public ApiRequest<HostProfileResponse> getHostProfile(@PathVariable String username) {
        return ApiRequest.<HostProfileResponse>builder()
                .success(true)
                .data(userService.getHostProfile(username))
                .build();
    }

    @PutMapping("/{username}/host-profile")
    public ApiRequest<HostProfileResponse> updateHostProfile(@PathVariable String username, @RequestBody HostProfileRequest dto) {
        return ApiRequest.<HostProfileResponse>builder()
                .success(true)
                .data(userService.updateHostProfile(username, dto))
                .build();
    }

    @GetMapping("/{username}/enterprise-profile")
    public ApiRequest<EnterpriseProfileResponse> getEnterpriseProfile(@PathVariable String username) {
        return ApiRequest.<EnterpriseProfileResponse>builder()
                .success(true)
                .data(userService.getEnterpriseProfile(username))
                .build();
    }

    @PutMapping("/{username}/enterprise-profile")
    public ApiRequest<EnterpriseProfileResponse> updateEnterpriseProfile(@PathVariable String username, @RequestBody EnterpriseProfileRequest dto) {
        return ApiRequest.<EnterpriseProfileResponse>builder()
                .success(true)
                .data(userService.updateEnterpriseProfile(username, dto))
                .build();
    }
}
