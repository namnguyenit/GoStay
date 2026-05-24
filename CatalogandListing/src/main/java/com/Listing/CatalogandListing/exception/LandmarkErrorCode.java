package com.Listing.CatalogandListing.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum LandmarkErrorCode implements ErrorCode {
    LANDMARK_NOT_FOUND(404, "Landmark not found", HttpStatus.NOT_FOUND),
    LANDMARK_ALREADY_EXISTS(400, "Landmark already exists", HttpStatus.BAD_REQUEST),
    SUGGESTION_NOT_FOUND(404, "Suggestion not found", HttpStatus.NOT_FOUND);

    private final int code;
    private final String message;
    private final HttpStatusCode httpStatus;

    LandmarkErrorCode(int code, String message, HttpStatusCode httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
