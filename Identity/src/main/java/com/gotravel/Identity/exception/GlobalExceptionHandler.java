package com.gotravel.Identity.exception;

import com.gotravel.Identity.dto.request.ApiRequest;
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
    ResponseEntity<ApiRequest> handleAppException(AppException appException) {
        ErrorCode errorCode = appException.getErrorCode();

        ApiRequest apiRequest = new ApiRequest();
        apiRequest.setSuccess(errorCode.isSuccess());
        apiRequest.setCode(errorCode.getCode());
        apiRequest.setMessage(errorCode.getMessage());

        return ResponseEntity
                .status(errorCode.getHttpStatus())
                .body(apiRequest);
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    ResponseEntity<ApiRequest> handleValidationException(MethodArgumentNotValidException exception) {
        String errorMessage = exception.getBindingResult().getFieldErrors()
                .stream()
                .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                .reduce((m1, m2) -> m1 + "; " + m2)
                .orElse(exception.getMessage());

        ApiRequest apiRequest = new ApiRequest();
        apiRequest.setSuccess(false);
        apiRequest.setCode(400);
        apiRequest.setMessage(errorMessage);

        return ResponseEntity.badRequest().body(apiRequest);
    }

    @ExceptionHandler(value = RuntimeException.class)
    ResponseEntity<ApiRequest> handleRuntimeException(RuntimeException runtimeException) {
        ApiRequest apiRequest = new ApiRequest();
        apiRequest.setSuccess(false);
        apiRequest.setCode(400);
        apiRequest.setMessage(runtimeException.getMessage());

        return ResponseEntity.badRequest().body(apiRequest);
    }

    @ExceptionHandler(value = DataIntegrityViolationException.class)
    ResponseEntity<ApiRequest> handleDataIntegrityViolationException(DataIntegrityViolationException exception) {
        ApiRequest apiRequest = new ApiRequest();
        apiRequest.setSuccess(false);
        apiRequest.setCode(409);
        apiRequest.setMessage("Data integrity violation: This record already exists or violates a unique constraint.");

        return ResponseEntity.status(409).body(apiRequest);
    }
}
