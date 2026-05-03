import multer from "multer";

const storage = multer.memoryStorage();



// Lọc hình ảnh

const imgFilter  = (req, file, callback) => {
    if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/webp') {
        callback(null, true);
    }else{
        callback(new Error("Chỉ được phép upload img ở định dạng ảnh"), false);
    }
};


//Lọc hình ảnh bảo mật

const secureImgFilter = (req, file, callback) => {
    if (file.mimetype === 'image/webp'|| file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
        callback(null, true);
    }else{
        callback(new Error('Chỉ được phép upload tài liệu ở dạng ảnh'),false);
    }
}

//Upload 1 ảnh đơn
export const uploadSingImage = multer({
    storage : storage,
    fileFilter : imgFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
}).single('file');

//Upload nhiều ảnh( tối đa 10 ảnh)
export const uploadBulkImage = multer({
    storage : storage,
    fileFilter : imgFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
}).array('file',10);


//up ảnh căn cước mặt trước mặt sau

export const uploadSecImage = multer({
    storage : storage,
    fileFilter : secureImgFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
}).array('file',2);





