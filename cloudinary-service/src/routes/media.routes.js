import express from 'express';
import {
    uploadSecImg,
    deleteImg,
    uploadBulkImg,
    uploadSingleImg
} from "../controllers/media.controller";
import {
    uploadSingImage,
    uploadSecImage,
    uploadBulkImage
} from "../middlewares/upload.middleware";

const router = express.Router();

router.post("/upload",(req,res,next)=>{
    uploadSingImage(req,res, function (error){
        if(error){
            return next(error);
        }
        next();
    })
}, uploadSingleImg);

router.post('/upload/bulk',(req,res,next)=>{
    uploadBulkImage(req,res, function (error){
        if(error){
            return next(error);
        }
        next();
    })
}, uploadBulkImg);

router.post('/upload/secure-document',(req,res,next)=>{
    uploadSecImage(req,res, function (error){
        if(error){
            return next(error);
        }
        next();
    })
}, uploadSecImg);

router.delete('/',deleteImg);


export default router;