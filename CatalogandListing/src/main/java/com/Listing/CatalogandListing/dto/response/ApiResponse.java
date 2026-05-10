package com.Listing.CatalogandListing.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    @Builder.Default
    private boolean success = true;
    @Builder.Default
    private int status = 200;
    private String code;
    private String message;
    private T data;

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, 200, "SUCCESS", "Success", data);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, 200, "SUCCESS", message, data);
    }

    public static <T> ApiResponse<T> created(String message, T data) {
        return new ApiResponse<>(true, 201, "CREATED", message, data);
    }

    public static <T> ApiResponse<T> created(String message) {
        return new ApiResponse<>(true, 201, "CREATED", message, null);
    }

    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(true, 200, "SUCCESS", message, null);
    }

    public static <T> ApiResponse<T> success(Boolean check, String message) {
        return new ApiResponse<>(check, 200, check ? "SUCCESS" : "FAILED", message, null);
    }
}
