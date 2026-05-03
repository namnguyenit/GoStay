import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {setupProxy} from './gateway/proxy.routes.js';

dotenv.config();

const app = express();

app.use(cors());

setupProxy(app);

app.get('/health', (req, res) =>{
    res.json({
        message: 'API gateway đang hoạt động'
    });
});

export default app;