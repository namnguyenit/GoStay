package com.Listing.CatalogandListing.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ComplexErrorCode implements ErrorCode {
    COMPLEX_NOT_FOUND(404, "Complex not found", HttpStatus.NOT_FOUND),
    COMPLEX_ALREADY_EXISTS(400, "Complex already exists", HttpStatus.BAD_REQUEST);

    private final int code;
    private final String message;
    private final HttpStatusCode httpStatus;

    ComplexErrorCode(int code, String message, HttpStatusCode httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
