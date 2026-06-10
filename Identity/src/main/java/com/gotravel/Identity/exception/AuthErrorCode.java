package com.gotravel.Identity.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum AuthErrorCode implements ErrorCode {
    UNAUTHENTICATED(401, "UNAUTHENTICATED", "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(403, "UNAUTHORIZED", "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_RESET_OTP(400, "INVALID_RESET_OTP", "Mã xác thực đặt lại mật khẩu không hợp lệ hoặc đã hết hạn", HttpStatus.BAD_REQUEST),
    EMAIL_SEND_FAILED(502, "EMAIL_SEND_FAILED", "Không thể gửi email. Vui lòng thử lại sau", HttpStatus.BAD_GATEWAY);

    private final boolean success = false;
    private final int status;
    private final String code;
    private final String message;
    private final HttpStatusCode httpStatus;

    AuthErrorCode(int status, String code, String message, HttpStatusCode httpStatus) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
