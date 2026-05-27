package com.gotravel.Identity.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum UserErrorCode implements ErrorCode {
    USER_NOT_FOUND(404, "USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND),
    USER_ALREADY_EXISTS(400, "USER_ALREADY_EXISTS", "User already exists", HttpStatus.BAD_REQUEST),
    EMAIL_ALREADY_EXISTS(400, "EMAIL_ALREADY_EXISTS", "Email already exists", HttpStatus.BAD_REQUEST),
    ROLE_NOT_FOUND(404, "ROLE_NOT_FOUND", "Role not found", HttpStatus.NOT_FOUND),
    ROLE_USER_ALREADY_EXISTS(400, "ROLE_USER_ALREADY_EXISTS", "Role user already exists", HttpStatus.BAD_REQUEST),
    BANED_USER(400, "BANNED_USER", "banned account", HttpStatus.BAD_REQUEST),
    DELETE_USER(400, "DELETE_USER", "deleted account", HttpStatus.BAD_REQUEST),
    POFILE_USER_AWAITING_EXISTS(409, "POFILE_USER_AWAITING_EXISTS", "User profile awaiting approval", HttpStatus.BAD_REQUEST),
    UPLOAD_IMAGE_FAILED(500, "UPLOAD_IMAGE_FAILED", "Failed to upload image", HttpStatus.INTERNAL_SERVER_ERROR),
    CANNOT_REMOVE_USER_ROLE(400, "CANNOT_REMOVE_USER_ROLE", "Cannot remove USER role from a user", HttpStatus.BAD_REQUEST),
    MUTUALLY_EXCLUSIVE_ROLES(400, "MUTUALLY_EXCLUSIVE_ROLES", "A user cannot be both a HOST and an ENTERPRISE", HttpStatus.BAD_REQUEST);

    private final boolean success = false;
    private final int status;
    private final String code;
    private final String message;
    private final HttpStatusCode httpStatus;

    UserErrorCode(int status, String code, String message, HttpStatusCode httpStatus) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
