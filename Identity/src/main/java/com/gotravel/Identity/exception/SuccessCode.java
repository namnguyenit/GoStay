package com.gotravel.Identity.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum SuccessCode implements ErrorCode {
    LOGIN_SUCCESS(200, "LOGIN_SUCCESS", "Authenticated successfully", HttpStatus.OK),
    USER_CREATED_SUCCESS(200, "USER_CREATED_SUCCESS", "User created successfully", HttpStatus.OK),
    GET_USERS_SUCCESS(200, "GET_USERS_SUCCESS", "Users retrieved successfully", HttpStatus.OK),
    GET_HOSTS_SUCCESS(200, "GET_HOSTS_SUCCESS", "Hosts retrieved successfully", HttpStatus.OK),
    GET_ALL_HOSTS_SUCCESS(200, "GET_ALL_HOSTS_SUCCESS", "All hosts retrieved successfully", HttpStatus.OK),
    GET_HOST_DETAIL_SUCCESS(200, "GET_HOST_DETAIL_SUCCESS", "Host detail retrieved successfully", HttpStatus.OK),
    APPROVAL_STATUS_UPDATED_SUCCESS(200, "APPROVAL_STATUS_UPDATED_SUCCESS", "Approval status updated successfully", HttpStatus.OK),
    ACCOUNT_BANNED_SUCCESS(200, "ACCOUNT_BANNED_SUCCESS", "Account banned successfully", HttpStatus.OK),
    ACCOUNT_ACTIVATED_SUCCESS(200, "ACCOUNT_ACTIVATED_SUCCESS", "Account activated successfully", HttpStatus.OK),
    GET_MY_INFO_SUCCESS(200, "GET_MY_INFO_SUCCESS", "User info retrieved successfully", HttpStatus.OK),
    UPDATE_MY_INFO_SUCCESS(200, "UPDATE_MY_INFO_SUCCESS", "User info updated successfully", HttpStatus.OK),
    USER_DELETED_SUCCESS(200, "USER_DELETED_SUCCESS", "User deleted successfully", HttpStatus.OK),
    USER_BANNED_SUCCESS(200, "USER_BANNED_SUCCESS", "User banned successfully", HttpStatus.OK),
    ROLE_UPGRADED_SUCCESS(200, "ROLE_UPGRADED_SUCCESS", "Role upgraded successfully", HttpStatus.OK),
    APPLICATION_SUBMITTED_SUCCESS(200, "APPLICATION_SUBMITTED_SUCCESS", "Application submitted successfully", HttpStatus.OK),
    APPLICATION_DELETED_SUCCESS(200, "APPLICATION_DELETED_SUCCESS", "Application deleted successfully", HttpStatus.OK),
    UPGRADE_TO_HOST_SUCCESS(200, "UPGRADE_TO_HOST_SUCCESS", "Upgraded to HOST successfully", HttpStatus.OK),
    UPGRADE_TO_ENTERPRISE_SUCCESS(200, "UPGRADE_TO_ENTERPRISE_SUCCESS", "Upgraded to ENTERPRISE successfully", HttpStatus.OK),
    GET_USER_PROFILE_SUCCESS(200, "GET_USER_PROFILE_SUCCESS", "User profile retrieved successfully", HttpStatus.OK),
    UPDATE_USER_PROFILE_SUCCESS(200, "UPDATE_USER_PROFILE_SUCCESS", "User profile updated successfully", HttpStatus.OK),
    GET_HOST_PROFILE_SUCCESS(200, "GET_HOST_PROFILE_SUCCESS", "Host profile retrieved successfully", HttpStatus.OK),
    UPDATE_HOST_PROFILE_SUCCESS(200, "UPDATE_HOST_PROFILE_SUCCESS", "Host profile updated successfully", HttpStatus.OK),
    GET_ENTERPRISE_PROFILE_SUCCESS(200, "GET_ENTERPRISE_PROFILE_SUCCESS", "Enterprise profile retrieved successfully", HttpStatus.OK),
    UPDATE_ENTERPRISE_PROFILE_SUCCESS(200, "UPDATE_ENTERPRISE_PROFILE_SUCCESS", "Enterprise profile updated successfully", HttpStatus.OK),
    USER_STATUS_RETRIEVED_SUCCESS(200, "USER_STATUS_RETRIEVED_SUCCESS", "User status retrieved successfully", HttpStatus.OK),
    UPLOAD_AVATAR_SUCCESS(200, "UPLOAD_AVATAR_SUCCESS", "Upload avatar successfully", HttpStatus.OK);

    private final boolean success = true;
    private final int status;
    private final String code;
    private final String message;
    private final HttpStatusCode httpStatus;

    SuccessCode(int status, String code, String message, HttpStatusCode httpStatus) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
