import { rateLimit } from "express-rate-limit";
import { buildErrorResponse, GatewayError } from "../utils/response.helper.js";

const normalizePath = (path) => path.replace(/\/+$/, "") || "/";

const matchesPath = (req, expectedPath) => {
    const requestPath = normalizePath(req.originalUrl.split("?")[0]);
    return requestPath === expectedPath;
};

const createAuthLimiter = ({ path, windowMs, limit, message }) => {
    return rateLimit({
        windowMs,
        limit,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        skip: (req) => !matchesPath(req, path),
        handler: (req, res) => {
            return buildErrorResponse(res, GatewayError.RATE_LIMIT_EXCEEDED, message);
        }
    });
};

export const authRateLimiters = [
    createAuthLimiter({
        path: "/api/v1/auth/login",
        windowMs: 15 * 60 * 1000,
        limit: 10,
        message: "Bạn đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút."
    }),
    createAuthLimiter({
        path: "/api/v1/auth/register",
        windowMs: 60 * 60 * 1000,
        limit: 5,
        message: "Bạn đăng ký quá nhiều lần. Vui lòng thử lại sau 1 giờ."
    })
];
