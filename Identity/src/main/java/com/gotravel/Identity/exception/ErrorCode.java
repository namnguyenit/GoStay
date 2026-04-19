package com.gotravel.Identity.exception;

import org.springframework.http.HttpStatusCode;

public interface ErrorCode {

    boolean getSuccess();
    void setSuccess(boolean success);

    int getCode();
    void setCode(int code);

    String getMessage();
    void setMessage(String message);

    HttpStatusCode getHttpStatus();
    void setHttpStatus(HttpStatusCode httpStatus);
}
