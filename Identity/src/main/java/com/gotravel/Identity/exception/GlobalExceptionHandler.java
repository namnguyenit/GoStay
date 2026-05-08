package com.gotravel.Identity.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.gotravel.Identity.dto.request.ApiRequest;

import lombok.extern.slf4j.Slf4j;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiRequest> handleAppException(AppException appException) {
        AppCode appCode = appException.getAppCode();

        ApiRequest apiRequest = new ApiRequest();
        apiRequest.setSuccess(errorCode.isSuccess());
        apiRequest.setStatus(errorCode.getStatus());
        apiRequest.setCode(errorCode.getCode());
        apiRequest.setMessage(errorCode.getMessage());

        return ResponseEntity
                .status(appCode.getHttpStatus())
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
        apiRequest.setStatus(AppErrorCode.VALIDATION_ERROR.getStatus());
        apiRequest.setCode(AppErrorCode.VALIDATION_ERROR.getCode());

    @ExceptionHandler(value = RuntimeException.class)
        ApiRequest apiRequest = new ApiRequest();
        apiRequest.setSuccess(false);
        apiRequest.setStatus(AppErrorCode.RUNTIME_ERROR.getStatus());
        apiRequest.setCode(AppErrorCode.RUNTIME_ERROR.getCode());
        apiRequest.setMessage(runtimeException.getMessage());

        return ResponseEntity.badRequest().body(apiRequest);
    }

    @ExceptionHandler(value = DataIntegrityViolationException.class)
    ResponseEntity<ApiRequest> handleDataIntegrityViolationException(DataIntegrityViolationException exception) {
        ApiRequest apiRequest = new ApiRequest();
        apiRequest.setSuccess(false);
        apiRequest.setStatus(AppErrorCode.DATA_INTEGRITY_VIOLATION.getStatus());
        apiRequest.setCode(AppErrorCode.DATA_INTEGRITY_VIOLATION.getCode());
        apiRequest.setMessage(AppErrorCode.DATA_INTEGRITY_VIOLATION.getMessage());

        return ResponseEntity.status(AppErrorCode.DATA_INTEGRITY_VIOLATION.getHttpStatus()).body(apiRequest);
    }
}
