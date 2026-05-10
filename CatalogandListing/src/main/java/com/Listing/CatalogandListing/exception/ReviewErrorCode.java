package com.Listing.CatalogandListing.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ReviewErrorCode implements ErrorCode {
    REVIEW_NOT_FOUND(404, "REVIEW_NOT_FOUND", "Review not found", HttpStatus.NOT_FOUND),
    USER_ALREADY_REVIEWED(400, "USER_ALREADY_REVIEWED", "User has already reviewed this listing", HttpStatus.BAD_REQUEST),
    INVALID_REVIEW_RATING(400, "INVALID_REVIEW_RATING", "Rating must be between 1 and 5", HttpStatus.BAD_REQUEST),
    REVIEW_ACCESS_DENIED(403, "REVIEW_ACCESS_DENIED", "You are not the owner of this review", HttpStatus.FORBIDDEN),
    REVIEW_UPDATE_EXPIRED(400, "REVIEW_UPDATE_EXPIRED", "Review can only be updated within 7 days", HttpStatus.BAD_REQUEST);

    private final boolean success = false;
    private final int status;
    private final String code;
    private final String message;
    private final HttpStatusCode httpStatus;

    ReviewErrorCode(int status, String code, String message, HttpStatusCode httpStatus) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
