import { createProxyMiddleware } from "http-proxy-middleware";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {buildErorRespone, GatewayError} from "../utils/response.helper.js";

import {identityRoutes} from "../configs/routes/identity.route.js";
import {mediaRoutes } from "../configs/routes/media.route.js";
import {catalogRoutes} from "../configs/routes/catalog.route.js";
import {bookingRoutes} from "../configs/routes/booking.route.js";
import {cartRoutes} from "../configs/routes/cart.route.js";
import {paymentRoutes} from "../configs/routes/payment.route.js";


export const setupProxy = (app) => {
    const routes = [
        ...identityRoutes, ...mediaRoutes, ...catalogRoutes, ...bookingRoutes, ...cartRoutes, ...paymentRoutes
    ];

    routes.sort((a, b) => b.url.length  - a.url.length);

    routes.forEach(route => {
        const middlewares = [
            ...(route.middlewares || []),
            ...(route.auth ? [verifyJWT] : [])
        ];

        app.use(route.url, middlewares, createProxyMiddleware({
            target: route.target,
            changeOrigin: true,
            pathRewrite: route.pathRewrite,
            onError: (err, req, res) => {
                console.error(`[Proxy Error] Chết kết nối tới ${route.target}${req.url} - Lý do: ${err.message}`);
                if (!res.headersSent){
                    return buildErorRespone(res, GatewayError.SERVICE_UNAVAILABLE)
                }
            }
        }));
    });
}
