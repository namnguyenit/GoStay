import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mediaRoutes from "./routes/media.routes.js";
import { ERROR_CODES } from "./constants/error_code.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());



app.use('/api/v1/media', mediaRoutes);
app.use((err, req, res, next) => {
    const code = err.code || err.message;
    const def = ERROR_CODES[code] || ERROR_CODES.INTERNAL_ERROR;

    console.error('[Media Error]', err.stack);
    return res.status(def.status).json({
        status: def.status,
        message: def.message,
        errorCode: def.errorCode,
        data: null
    });
});

const PORT = process.env.MEDIA_PORT || 5001;
app.listen(PORT, () => {
    console.log(`🖼️ Media Service chạy tại: http://localhost:${PORT}`);
});