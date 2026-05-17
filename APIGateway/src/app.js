import express from 'express';
import cors from 'cors';
import {setupProxy} from './gateway/proxy.routes.js';

const app = express();

app.use(cors());

setupProxy(app);

app.get('/health', (req, res) => {
    // Log ra console để ghi nhận có request (tạo activity log)
    console.log(`[${new Date().toISOString()}] Health check pinged!`);
    res.status(200).json({
        status: 'OK',
        message: 'API gateway đang hoạt động bình thường',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

export default app;