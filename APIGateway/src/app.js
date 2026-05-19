import express from 'express';
import cors from 'cors';
import {setupProxy} from './gateway/proxy.routes.js';
import { buildSuccessResponse, GatewaySuccess } from './utils/response.helper.js';

const app = express();

app.use(cors());

setupProxy(app);

app.get('/health', (req, res) => {
    // Log ra console để ghi nhận có request (tạo activity log)
    console.log(`[${new Date().toISOString()}] Health check pinged!`);
    return buildSuccessResponse(res, GatewaySuccess.HEALTH_CHECK_SUCCESS, {
        service: 'APIGateway',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

export default app;
