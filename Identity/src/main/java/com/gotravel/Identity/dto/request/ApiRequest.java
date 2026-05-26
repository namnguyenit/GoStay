package com.gotravel.Identity.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.gotravel.Identity.exception.ErrorCode;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiRequest <T>{
    @Builder.Default
    boolean success = true;
    @Builder.Default
    int status = 200;
    String code;
    String message;
    T data;

    public static <T> ApiRequest<T> success(ErrorCode successCode, T data) {
        return success(successCode, data, successCode.isSuccess());
    }

    public static <T> ApiRequest<T> success(ErrorCode successCode, T data, boolean success) {
        return ApiRequest.<T>builder()
                .success(success)
                .status(successCode.getStatus())
                .code(successCode.getCode())
                .message(successCode.getMessage())
                .data(data)
                .build();
    }

    public static <T> ApiRequest<T> success(ErrorCode successCode) {
        return success(successCode, null);
    }
}
