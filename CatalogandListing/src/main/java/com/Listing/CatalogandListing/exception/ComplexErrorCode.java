package com.Listing.CatalogandListing.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ComplexErrorCode implements ErrorCode {
    COMPLEX_NOT_FOUND(404, "COMPLEX_NOT_FOUND", "Complex not found", HttpStatus.NOT_FOUND),
    COMPLEX_ALREADY_EXISTS(400, "COMPLEX_ALREADY_EXISTS", "Complex already exists", HttpStatus.BAD_REQUEST),
    COMPLEX_ACCESS_DENIED(403, "COMPLEX_ACCESS_DENIED", "You do not have permission to access this complex", HttpStatus.FORBIDDEN);

    private final boolean success = false;
    private final int status;
    private final String code;
    private final String message;
    private final HttpStatusCode httpStatus;

    ComplexErrorCode(int status, String code, String message, HttpStatusCode httpStatus) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
