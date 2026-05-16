export const GatewayError = {
    MISSING_TOKEN: { status: 401, code: "AUTH_MISSING_TOKEN", message: "Vui lòng cung cấp token xác thực." },
    INVALID_TOKEN: { status: 403, code: "AUTH_INVALID_TOKEN", message: "Token không hợp lệ hoặc đã hết hạn." },
    ACCOUNT_BANNED: { status: 403, code: "AUTH_ACCOUNT_BANNED", message: "Tài khoản của bạn đã bị vô hiệu hóa hoặc xóa." },
    INTERNAL_ERROR: { status: 500, code: "GATEWAY_INTERNAL_ERROR", message: "Lỗi nội bộ tại API Gateway." },
    SERVICE_UNAVAILABLE: { status: 503, code: "GATEWAY_SERVICE_UNAVAILABLE", message: "Service đích hiện không phản hồi." }
};


export const buildErorRespone =(res, errorConfig, customMessage) => {
    return res.status(errorConfig.status).json({
        success: false,
        status: errorConfig.status,
        code: errorConfig.code,
        message: errorConfig.message,
        data: null
    });
}