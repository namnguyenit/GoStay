package com.Listing.CatalogandListing.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ReviewErrorCode implements ErrorCode {
    REVIEW_NOT_FOUND(404, "Review not found", HttpStatus.NOT_FOUND),
    USER_ALREADY_REVIEWED(400, "User has already reviewed this listing", HttpStatus.BAD_REQUEST),
    INVALID_REVIEW_RATING(400, "Rating must be between 1 and 5", HttpStatus.BAD_REQUEST),
    ORDER_NOT_COMPLETED(403, "User can review only after completing this listing order", HttpStatus.FORBIDDEN),
    ORDER_SERVICE_UNAVAILABLE(503, "Cannot verify completed order for review", HttpStatus.SERVICE_UNAVAILABLE);

    private final int code;
    private final String message;
    private final HttpStatusCode httpStatus;

    ReviewErrorCode(int code, String message, HttpStatusCode httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
