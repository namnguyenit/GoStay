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
    private boolean success;
    private int code;
    private String message;
    private T data;
    
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true,200, "Success", data);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true,200, message, data);
    }
    
    public static <T> ApiResponse<T> created(String message,T data) {
        return new ApiResponse<>(true,201, message, data);
    }

    public static <T> ApiResponse<T> created(String message) {
        return new ApiResponse<>(true,201, message, null);
    }

    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(true,200, message, null);
    }
}
