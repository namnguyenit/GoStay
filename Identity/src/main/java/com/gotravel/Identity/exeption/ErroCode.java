package com.gotravel.Identity.exeption;
import org.springframework.http.HttpStatusCode;

public interface ErroCode {

    public boolean getSuccess();

    public  void setSuccess(boolean success);

    public int getCode();

    public void setCode(int code) ;

    public String getMessage() ;

    public void setMessage(String message) ;

    public HttpStatusCode getHttpStatus() ;

    public void setHttpStatus(HttpStatusCode httpStatus) ;
}
