package com.Listing.CatalogandListing.exception;

import com.Listing.CatalogandListing.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(value = AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException appException) {
        ErrorCode errorCode = appException.getErrorCode();

        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setStatus(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());

        return ResponseEntity
                .status(errorCode.getHttpStatus())
                .body(apiResponse);
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException exception) {
        String errorMessage = exception.getBindingResult().getFieldErrors()
                .stream()
                .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                .reduce((m1, m2) -> m1 + "; " + m2)
                .orElse(exception.getMessage());

        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setStatus(400);
        apiResponse.setMessage(errorMessage);

        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(value = RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleRuntimeException(RuntimeException runtimeException) {
        log.error("Unhandled exception", runtimeException);
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setStatus(400);
        apiResponse.setMessage(runtimeException.getMessage());

        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(value = DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolationException(DataIntegrityViolationException exception) {
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setStatus(409);
        apiResponse.setMessage("Data integrity violation: This record already exists or violates a unique constraint.");

        return ResponseEntity.status(409).body(apiResponse);
    }
}
