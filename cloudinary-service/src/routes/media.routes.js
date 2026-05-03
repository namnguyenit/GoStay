import express from 'express';
import {
    uploadSecImg,
    deleteImg,
    uploadBulkImg,
    uploadSingleImg
} from "../controllers/media.controller.js";
import {
    uploadSingImage,
    uploadSecImage,
    uploadBulkImage
} from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/upload", uploadSingImage, uploadSingleImg);

router.post('/upload/bulk', uploadBulkImage, uploadBulkImg);

router.post('/upload/secure-documents', uploadSecImage, uploadSecImg);

router.delete('/',deleteImg);


export default router;