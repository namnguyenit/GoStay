package com.gotravel.PaymentandWallet.exeption;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum PaymentErrorCode implements ErrorCode {
    PAYMENT_NOT_FOUND(404, "PAYMENT_NOT_FOUND", "Không tìm thấy yêu cầu thanh toán", HttpStatus.NOT_FOUND),
    PAYMENT_ALREADY_COMPLETED(400, "PAYMENT_ALREADY_COMPLETED", "Giao dịch này đã được thanh toán", HttpStatus.BAD_REQUEST),
    PAYMENT_EXPIRED(400, "PAYMENT_EXPIRED", "Phiên thanh toán đã hết hạn", HttpStatus.BAD_REQUEST),
    INVALID_ORDER_FOR_PAYMENT(400, "INVALID_ORDER_FOR_PAYMENT", "Đơn hàng không hợp lệ để tạo thanh toán", HttpStatus.BAD_REQUEST),
    DUPLICATE_TRANSACTION(409, "DUPLICATE_TRANSACTION", "Giao dịch trùng lặp", HttpStatus.CONFLICT),
    AMOUNT_MISMATCH(400, "AMOUNT_MISMATCH", "Số tiền chuyển khoản không khớp với đơn hàng", HttpStatus.BAD_REQUEST),
    INVALID_WEBHOOK(400, "INVALID_WEBHOOK", "Dữ liệu webhook không hợp lệ", HttpStatus.BAD_REQUEST);

    private final boolean success = false;
    private final int status;
    private final String code;
    private final String message;
    private final HttpStatusCode httpStatus;

    PaymentErrorCode(int status, String code, String message, HttpStatusCode httpStatus) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
