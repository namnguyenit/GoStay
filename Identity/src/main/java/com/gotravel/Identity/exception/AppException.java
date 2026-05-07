package com.gotravel.Identity.exception;

public class AppException extends RuntimeException {
    private AppCode appCode;

    public AppException(AppCode appCode) {
        super(appCode.getMessage());
        this.appCode = appCode;
    }

    public AppCode getAppCode() {
        return appCode;
    }

    public void setAppCode(AppCode appCode) {
        this.appCode = appCode;
    }
}
