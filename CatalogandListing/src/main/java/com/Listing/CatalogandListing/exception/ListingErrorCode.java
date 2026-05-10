package com.Listing.CatalogandListing.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ListingErrorCode implements ErrorCode {
    LISTING_NOT_FOUND(404, "LISTING_NOT_FOUND", "Listing not found", HttpStatus.NOT_FOUND),
    LISTING_ALREADY_EXISTS(400, "LISTING_ALREADY_EXISTS", "Listing already exists", HttpStatus.BAD_REQUEST),
    INVALID_LISTING_DATA(400, "INVALID_LISTING_DATA", "Invalid listing data provided", HttpStatus.BAD_REQUEST),
    LISTING_UNAVAILABLE(400, "LISTING_UNAVAILABLE", "Listing is currently unavailable", HttpStatus.BAD_REQUEST),
    LISTING_ACCESS_DENIED(403, "LISTING_ACCESS_DENIED", "You don't have permission to modify this listing", HttpStatus.FORBIDDEN);

    private final boolean success = false;
    private final int status;
    private final String code;
    private final String message;
    private final HttpStatusCode httpStatus;

    ListingErrorCode(int status, String code, String message, HttpStatusCode httpStatus) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
