export const verifyInternalToken = (req, res, next) => {
    const configuredToken =
        process.env.EMAIL_INTERNAL_TOKEN ||
        process.env.INTERNAL_SERVICE_TOKEN ||
        process.env.MEDIA_INTERNAL_SERVICE_TOKEN;

    const providedToken =
        req.headers["x-internal-service-token"] ||
        req.headers["x-internal-token"] ||
        (req.headers.authorization || "").replace(/^Bearer\s+/i, "");

    if (!configuredToken) {
        if (process.env.NODE_ENV === "production") {
            return res.status(503).json({
                success: false,
                status: 503,
                code: "INTERNAL_TOKEN_NOT_CONFIGURED",
                message: "Internal email token is not configured",
                data: null,
            });
        }

        console.warn("[Email Warning] Internal token is not configured; allowing request in non-production mode.");
        return next();
    }

    if (providedToken !== configuredToken) {
        return res.status(401).json({
            success: false,
            status: 401,
            code: "UNAUTHORIZED",
            message: "Unauthorized internal email request",
            data: null,
        });
    }

    return next();
};
