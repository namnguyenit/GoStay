package com.gotravel.Identity.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum HostErrorCode implements ErrorCode {
    HOST_PROFILE_NOT_FOUND(404, "HOST_PROFILE_NOT_FOUND", "User does not have a Host profile", HttpStatus.NOT_FOUND),
    USER_NOT_HOST(403, "USER_NOT_HOST", "User is not a HOST", HttpStatus.FORBIDDEN),
    HOST_PROFILE_NOT_EXIST(400 , "HOST_PROFILE_NOT_EXIST" , "Profile user don't exist" , HttpStatus.BAD_REQUEST);

    private final boolean success = false;
    private final int status;
    private final String code;
    private final String message;
    private final HttpStatusCode httpStatus;

    HostErrorCode(int status, String code, String message, HttpStatusCode httpStatus) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
