package com.gotravel.Identity.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum HostErrorCode implements ErrorCode {
    HOST_PROFILE_NOT_FOUND(404, "User does not have a Host profile", HttpStatus.NOT_FOUND),
    USER_NOT_HOST(403, "User is not a HOST", HttpStatus.FORBIDDEN);

    private final boolean success = false;
    private final int code;
    private final String message;
    private final HttpStatusCode httpStatus;

    HostErrorCode(int code, String message, HttpStatusCode httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
