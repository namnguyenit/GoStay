package com.gotravel.Identity.exeption;

import com.gotravel.Identity.dto.request.ApiRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

@ControllerAdvice
@Slf4j
public class GlobalExeptionHandler {
    @ExceptionHandler(value = AppExeption.class)
    ResponseEntity<ApiRequest> handleAppExeption(AppExeption appExeption){
        ErroCode erroCode = appExeption.getErroCode();

        ApiRequest apiRequest = new ApiRequest();

        apiRequest.setSuccess(erroCode.getSuccess());
        apiRequest.setCode(erroCode.getCode());
        apiRequest.setMesseger(erroCode.getMessage());

        return ResponseEntity
                .status(erroCode.getHttpStatus())
                .body(apiRequest);

    }
}
