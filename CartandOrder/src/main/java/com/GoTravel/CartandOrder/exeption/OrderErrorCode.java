package com.GoTravel.CartandOrder.exeption;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum OrderErrorCode implements ErrorCode {
    CART_NOT_FOUND(404, "CART_NOT_FOUND", "Giỏ hàng không tồn tại", HttpStatus.NOT_FOUND),
    CART_ITEM_NOT_FOUND(404, "CART_ITEM_NOT_FOUND", "Sản phẩm không có trong giỏ hàng", HttpStatus.NOT_FOUND),
    INVALID_CART_ITEM_REQUEST(400, "INVALID_CART_ITEM_REQUEST", "Thông tin sản phẩm trong giỏ hàng không hợp lệ", HttpStatus.BAD_REQUEST),
    ORDER_NOT_FOUND(404, "ORDER_NOT_FOUND", "Không tìm thấy đơn hàng", HttpStatus.NOT_FOUND),
    LISTING_NOT_AVAILABLE(400, "LISTING_NOT_AVAILABLE", "Dịch vụ không tồn tại hoặc không còn khả dụng", HttpStatus.BAD_REQUEST),
    INVENTORY_LOCK_FAILED(409, "INVENTORY_LOCK_FAILED", "Phòng/Dịch vụ bạn chọn đã hết chỗ hoặc đang bảo trì", HttpStatus.CONFLICT),
    MULTIPLE_HOSTS_NOT_SUPPORTED(400, "MULTIPLE_HOSTS_NOT_SUPPORTED", "Giỏ hàng chỉ được checkout các dịch vụ của cùng một host", HttpStatus.BAD_REQUEST),
    INVALID_ORDER_STATE(400, "INVALID_ORDER_STATE", "Trạng thái đơn hàng không hợp lệ cho thao tác này", HttpStatus.BAD_REQUEST),
    CART_IS_EMPTY(400, "CART_IS_EMPTY", "Giỏ hàng trống", HttpStatus.BAD_REQUEST);

    private final boolean success = false;
    private final int status;
    private final String code;
    private final String message;
    private final HttpStatusCode httpStatus;

    OrderErrorCode(int status, String code, String message, HttpStatusCode httpStatus) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
