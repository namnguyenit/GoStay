package com.gotravel.Identity.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum AppErrorCode implements ErrorCode {
    VALIDATION_ERROR(400, "VALIDATION_ERROR", "Validation error", HttpStatus.BAD_REQUEST),
    RUNTIME_ERROR(400, "RUNTIME_ERROR", "Runtime error", HttpStatus.BAD_REQUEST),
    DATA_INTEGRITY_VIOLATION(409, "DATA_INTEGRITY_VIOLATION", "Data integrity violation", HttpStatus.CONFLICT),
    UNCATEGORIZED_EXCEPTION(500, "UNCATEGORIZED_EXCEPTION", "Uncategorized exception", HttpStatus.INTERNAL_SERVER_ERROR);

    private final boolean success = false;
    private final int status;
    private final String code;
    private final String message;
    private final HttpStatusCode httpStatus;

    AppErrorCode(int status, String code, String message, HttpStatusCode httpStatus) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
