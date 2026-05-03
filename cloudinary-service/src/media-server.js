import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mediaRoutes from "./routes/media.routes";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());



app.use('/api/v1/media', mediaRoutes);
app.use((err, req, res, next) => {
    // 1. Lỗi định dạng từ Multer (Do ta tự định nghĩa)
    if (err.message === 'INVALID_IMAGE_FORMAT') {
        return res.status(400).json({
            status: 400,
            message: 'File quá lớn hoặc sai định dạng. Vui lòng chọn ảnh dưới 5MB (JPG, PNG, WEBP).',
            data: null
        });
    }
    if (err.message === 'INVALID_DOC_FORMAT') {
        return res.status(415).json({
            status: 415,
            message: 'Định dạng tệp không được hỗ trợ. Chỉ cho phép PDF, JPG, PNG.',
            data: null
        });
    }

    // 2. Lỗi vượt quá giới hạn cấu hình của Multer
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            status: 400,
            message: 'File quá lớn. Vượt quá giới hạn cho phép.',
            data: null
        });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
            status: 400,
            message: 'Vượt quá giới hạn 10 ảnh trong một lần tải lên.',
            data: null
        });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            status: 400,
            message: 'Sai tên field form-data. Vui lòng kiểm tra lại tài liệu (file/files).',
            data: null
        });
    }

    // 3. Lỗi hệ thống không xác định
    console.error('[Media Error]', err.stack);
    return res.status(500).json({
        status: 500,
        message: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.',
        data: null
    });
});

const PORT = process.env.MEDIA_PORT || 5001;
app.listen(PORT, () => {
    console.log(`🖼️ Media Service chạy tại: http://localhost:${PORT}`);
});