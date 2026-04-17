package com.gotravel.Identity.exeption;
import org.springframework.http.HttpStatusCode;

public interface ErroCode {

    public int getCode();

    public void setCode(int code) ;

    public String getMessage() ;

    public void setMessage(String message) ;

    public HttpStatusCode getHttpStatus() ;

    public void setHttpStatus(HttpStatusCode httpStatus) ;
}
