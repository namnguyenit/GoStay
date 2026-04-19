package com.gotravel.Identity.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum EnterpriseErrorCode implements ErrorCode {
    ENTERPRISE_PROFILE_NOT_FOUND(404, "User does not have an Enterprise profile", HttpStatus.NOT_FOUND),
    USER_NOT_ENTERPRISE(403, "User is not an ENTERPRISE", HttpStatus.FORBIDDEN);

    private final boolean success = false;
    private final int code;
    private final String message;
    private final HttpStatusCode httpStatus;

    EnterpriseErrorCode(int code, String message, HttpStatusCode httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
