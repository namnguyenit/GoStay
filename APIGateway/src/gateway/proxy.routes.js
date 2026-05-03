import { createProxyMiddleware } from "http-proxy-middleware";
import { verifyJWT } from "../middlewares/auth.middleware";

export const setupProxy = (app) => {
    const routes = [
        {
            url: 'api/auth',
            target : process.env.IDENTITY_SERVICE_URL,
            auth:false
        }

    ];

    routes.forEach(route => {
        const middleware = route.auth ? [verifyJWT] :[]
        app.use(route.url, middleware, createProxyMiddleware({
            target: route.target,
            changeOrigin: true,
            onProxyReg: (proxyReg, req,res) => {
                const userId = req.header['x-user-id'];
                if (req.header[])
            }
        }))
    })
}
