package com.Listing.CatalogandListing.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ListingErrorCode implements ErrorCode {
    LISTING_NOT_FOUND(404, "Listing not found", HttpStatus.NOT_FOUND),
    LISTING_ALREADY_EXISTS(400, "Listing already exists", HttpStatus.BAD_REQUEST),
    INVALID_LISTING_DATA(400, "Invalid listing data provided", HttpStatus.BAD_REQUEST),
    LISTING_UNAVAILABLE(400, "Listing is currently unavailable", HttpStatus.BAD_REQUEST),
    LISTING_ACCESS_DENIED(403, "You don't have permission to modify this listing", HttpStatus.FORBIDDEN),
    LISTING_OUT_OF_RANGE(400, "Dịch vụ phải nằm trong bán kính 3km xung quanh Khu tổ hợp", HttpStatus.BAD_REQUEST);

    private final int code;
    private final String message;
    private final HttpStatusCode httpStatus;

    ListingErrorCode(int code, String message, HttpStatusCode httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
