package com.gotravel.Identity.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum UserErrorCode implements ErrorCode {
    USER_NOT_FOUND(404, "USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND),
    USER_ALREADY_EXISTS(400, "USER_ALREADY_EXISTS", "User already exists", HttpStatus.BAD_REQUEST),
    EMAIL_ALREADY_EXISTS(400, "EMAIL_ALREADY_EXISTS", "Email already exists", HttpStatus.BAD_REQUEST),
    ROLE_NOT_FOUND(404, "ROLE_NOT_FOUND", "Role not found", HttpStatus.NOT_FOUND);

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
