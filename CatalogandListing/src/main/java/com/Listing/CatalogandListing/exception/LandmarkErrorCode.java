package com.Listing.CatalogandListing.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum LandmarkErrorCode implements ErrorCode {
    LANDMARK_NOT_FOUND(404, "LANDMARK_NOT_FOUND", "Landmark not found", HttpStatus.NOT_FOUND),
    LANDMARK_ALREADY_EXISTS(400, "LANDMARK_ALREADY_EXISTS", "Landmark already exists", HttpStatus.BAD_REQUEST),
    SUGGESTION_NOT_FOUND(404, "SUGGESTION_NOT_FOUND", "Suggestion not found", HttpStatus.NOT_FOUND);

    private final boolean success = false;
    private final int status;
    private final String code;
    private final String message;
    private final HttpStatusCode httpStatus;

    LandmarkErrorCode(int status, String code, String message, HttpStatusCode httpStatus) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
