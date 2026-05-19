

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
import {rbacMedia} from "../middlewares/rbac.middleware.js";
import { verifyMediaJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyMediaJWT);

router.post("/upload", uploadSingImage, rbacMedia('single'), uploadSingleImg);

router.post('/upload/bulk', uploadBulkImage, rbacMedia('bulk'), uploadBulkImg);

router.post('/upload/secure-documents', uploadSecImage, rbacMedia('secure'), uploadSecImg);

router.delete('/', rbacMedia('delete'), deleteImg);


export default router;
