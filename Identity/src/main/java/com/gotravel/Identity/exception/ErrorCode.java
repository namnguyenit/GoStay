package com.gotravel.Identity.exception;

import org.springframework.http.HttpStatusCode;

public interface ErrorCode {

    boolean isSuccess();
    int getCode();
    String getMessage();
    HttpStatusCode getHttpStatus();
}
