import cloudinary from "../configs/cloudinary.config";
import streamifier from 'streamifier';
import sharp from "sharp";


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
            return res.status(400).json(
                {
                    status: '400',
                    message: 'Vui lòng đính kèm file', data: null,
                }
            )
        }
        const {folder} = req.body;
        if (!folder){
            return res.status(400).json(
                {
                    status: '400',
                    message: "Thiếu tham số 'folder'", data: null,
                }
            )
        }
        const optimizedBuffer = await sharp(req.file.buffer)
            .webp({quality:80})
            .toBuffer();
        const result = await upToCloudinary(optimizedBuffer, folder,false);
        return res.status(200).json({
            status: '200',
            message: 'Upload thành công',
            data: {
                url: result.secure_url,
                publicId : result.public_id,
                resourceType : result.resource_type,
            }
        })
    } catch (error) {
        next(error)
    }
}

//up nhiều ảnh

export const uploadBulkImg = async (req, res, next) =>{
    try {
            if (!req.files||req.files.length === 0){
                return res.status(400).json({
                    status: '400',
                    message: 'Vui lòng đính kèm file',
                    data: null,
                })
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

            return res.status(200).json({
                status: '200',
                message: "Upload danh sách ảnh thành công",
                data: {
                    url: urls,
                }
            })
    } catch (error){
        next(error);
    }
}


// Up ảnh mật

export const uploadSecImg = async (req, res, next) =>{
    try{
        const files = req.files;
        if (!files || files.length === 0){
            return res.status(400).json({
                status: '400',
                message: 'Vui lòng đính kèm file',
                data: null,
            })
        }
        const folder = 'secImg';
        const uploadPromise = files.map(file => upToCloudinary(file.buffer, folder, true));
        const results = await Promise.all(uploadPromise);
        return res.status(200).json({
            status: '200',
            message: 'Upload tài liệu mật thành công',
            data: {
                urls: results.map(result => result.secure_url),
                documentIds: results.map(result => result.public_id),
            }
        });
    }catch (error){
        next(error);
    }
}

// Xóa ảnh

export const deleteImg = async (req, res, next) =>{
    try{
        const { publicId } = req.body;
        if (!publicId){
            return res.status(400).json({
                status: '400',
                message: 'Thiếu publicId để xóa file'
            })
        }
        const result = await cloudinary.uploader.destroy(publicId);
        if(result.result === 'not found'){
            return res.status(404).json({
                status: '404',
                message: 'Không tìm thấy ảnh'
            })
        }
        return res.status(200).json({
            status: '200',
            message:'Xóa ảnh thành công',
            data:null
        })
    }catch (error){
        next(error);
    }
}
