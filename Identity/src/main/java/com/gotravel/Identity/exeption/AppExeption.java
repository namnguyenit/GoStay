package com.gotravel.Identity.exeption;

public class AppExeption extends RuntimeException {
    private ErroCode erroCode;

    public AppExeption(ErroCode erroCode) {
        super(erroCode.getMessage());
        this.erroCode = erroCode;
    }

    public ErroCode getErroCode() {
        return erroCode;
    }

    public void setErroCode(ErroCode erroCode) {
        this.erroCode = erroCode;
    }
}