import cloudinary from "../configs/cloudinary.config.js";
import streamifier from 'streamifier';
import sharp from "sharp";
import {throwError} from "../utils/throwError.js";
import {SUCCESS_CODE} from "../constants/success-code.js";
import {buildSuccess} from "../utils/throwSuccess.js";



const upToCloudinary = (fileBuffer, folderPath, isPrivate) => {
    return new Promise((resolve, reject) => {
        const option = {
            folder: folderPath || 'uncategorized',
            resource_type :'auto',
        };

        if (isPrivate){
            option.type = 'private';
        }

        const stream  = cloudinary.uploader.upload_stream(option,(error, result) => {
            if (result) resolve(result);
            else reject(error);
        });
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};


// up ảnh đơn
export const uploadSingleImg = async (req, res, next) =>{
    try {
        if (!req.file){
            return next(throwError("INVALID_IMAGE_FORMAT"))
        }
        const {folder} = req.body;
        if (!folder){
            return next(throwError("MISSING_FOLDER"))
        }
        const optimizedBuffer = await sharp(req.file.buffer)
            .webp({quality:80})
            .toBuffer();
        const result = await upToCloudinary(optimizedBuffer, folder,false);
        const data =  {
            url: result.secure_url,
            publicId : result.public_id,
            resourceType : result.resource_type,
        }
        return res.status(SUCCESS_CODE.UPLOAD_SINGLE_SUCCESS.status).json(
            buildSuccess('UPLOAD_SINGLE_SUCCESS',data),
        )
    } catch (error) {
        next(error)
    }
}

//up nhiều ảnh

export const uploadBulkImg = async (req, res, next) =>{
    try {
            if (!req.files||req.files.length === 0){
                return next(throwError('MISSING_FILE'))
            }
            const folder = req.body.folder || 'listing/galleries';

            const uploadPromise = req.files.map(async file => {
                const optimizedBuffer = await sharp(file.buffer)
                    .webp({quality:80})
                    .toBuffer();
                return upToCloudinary(optimizedBuffer, folder,false);
            });
            const results = await Promise.all(uploadPromise);

            // Lấy danh sách URL
            const urls = results.map(result => result.secure_url);
            const data =  {
                url: urls,
            }
            return res.status(SUCCESS_CODE.UPLOAD_BULK_SUCCESS.status).json(
                buildSuccess('UPLOAD_BULK_SUCCESS',data),
            )
    } catch (error){
        next(error);
    }
}


// Up ảnh mật

export const uploadSecImg = async (req, res, next) =>{
    try{
        const files = req.files;
        if (!files || files.length === 0){
            return next(throwError("MISSING_FILE"))
        }
        const folder = 'secImg';
        const uploadPromise = files.map(file => upToCloudinary(file.buffer, folder, true));
        const results = await Promise.all(uploadPromise);
        const data =  {
            urls: results.map(result => result.secure_url),
            documentIds: results.map(result => result.public_id),
        }
        return res.status(SUCCESS_CODE.UPLOAD_SECURE_SUCCESS.status).json(
            buildSuccess('UPLOAD_SECURE_SUCCESS',data),
        )
    }catch (error){
        next(error);
    }
}

// Xóa ảnh

export const deleteImg = async (req, res, next) =>{
    try{
        const { publicId } = req.body;
        if (!publicId){
            return next(throwError("MISSING_PUBLIC_ID"))
        }
        const result = await cloudinary.uploader.destroy(publicId);
        if(result.result === 'not found'){
            return next(throwError("CLOUDINARY_NOT_FOUND"))
        }
        return res.status(SUCCESS_CODE.DELETE_SUCCESS.status).json(
            buildSuccess('DELETE_SUCCESS', null)
        )
    }catch (error){
        next(error);
    }
}
