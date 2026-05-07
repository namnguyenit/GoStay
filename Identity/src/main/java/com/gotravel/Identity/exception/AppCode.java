package com.gotravel.Identity.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum AppCode {
    // ---- SUCCESS CODES ----
    SUCCESS(true, 200, "SUCCESS", "Request completed successfully", HttpStatus.OK),
    CREATE_SUCCESS(true, 200, "CREATE_SUCCESS", "Created successfully", HttpStatus.OK),
    UPDATE_SUCCESS(true, 200, "UPDATE_SUCCESS", "Updated successfully", HttpStatus.OK),
    DELETE_SUCCESS(true, 200, "DELETE_SUCCESS", "Deleted successfully", HttpStatus.OK),
    FETCH_SUCCESS(true, 200, "FETCH_SUCCESS", "Fetched successfully", HttpStatus.OK),
    LOGIN_SUCCESS(true, 200, "LOGIN_SUCCESS", "Authenticated successfully", HttpStatus.OK),
    UPGRADE_SUCCESS(true, 200, "UPGRADE_SUCCESS", "Upgraded successfully", HttpStatus.OK),

    // ---- ERROR CODES ----
    USER_NOT_FOUND(false, 404, "USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND),
    USER_ALREADY_EXISTS(false, 400, "USER_ALREADY_EXISTS", "User already exists", HttpStatus.BAD_REQUEST),
    EMAIL_ALREADY_EXISTS(false, 400, "EMAIL_ALREADY_EXISTS", "Email already exists", HttpStatus.BAD_REQUEST),
    ROLE_NOT_FOUND(false, 404, "ROLE_NOT_FOUND", "Role not found", HttpStatus.NOT_FOUND),
    
    UNAUTHENTICATED(false, 401, "UNAUTHENTICATED", "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(false, 403, "UNAUTHORIZED", "You do not have permission", HttpStatus.FORBIDDEN),

    ENTERPRISE_PROFILE_NOT_FOUND(false, 404, "ENTERPRISE_PROFILE_NOT_FOUND", "User does not have an Enterprise profile", HttpStatus.NOT_FOUND),
    USER_NOT_ENTERPRISE(false, 403, "USER_NOT_ENTERPRISE", "User is not an ENTERPRISE", HttpStatus.FORBIDDEN),
    HOST_PROFILE_NOT_FOUND(false, 404, "HOST_PROFILE_NOT_FOUND", "User does not have a Host profile", HttpStatus.NOT_FOUND),
    USER_NOT_HOST(false, 403, "USER_NOT_HOST", "User is not a HOST", HttpStatus.FORBIDDEN),

    VALIDATION_ERROR(false, 400, "VALIDATION_ERROR", "Validation error", HttpStatus.BAD_REQUEST),
    RUNTIME_ERROR(false, 400, "RUNTIME_ERROR", "Runtime error", HttpStatus.BAD_REQUEST),
    DATA_INTEGRITY_VIOLATION(false, 409, "DATA_INTEGRITY_VIOLATION", "Data integrity violation", HttpStatus.CONFLICT),
    UNCATEGORIZED_EXCEPTION(false, 500, "UNCATEGORIZED_EXCEPTION", "Uncategorized exception", HttpStatus.INTERNAL_SERVER_ERROR);

    private final boolean success;
    private final int status;
    private final String code;
    private final String message;
    private final HttpStatusCode httpStatus;

    AppCode(boolean success, int status, String code, String message, HttpStatusCode httpStatus) {
        this.success = success;
        this.status = status;
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
