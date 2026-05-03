/** @type {const} */
export const ERROR_CODES = {
    // Validation
    MISSING_FILE: {
        status: 400,
        message: 'Vui lòng đính kèm file',
        errorCode: "MISSING_FILE"
    },
    MISSING_FOLDER: {
        status: 400,
        message: "Thiếu tham số 'folder'",
        errorCode: "MISSING_FOLDER"
    },
    MISSING_PUBLIC_ID: {
        status: 400,
        message: 'Thiếu publicId để xóa file',
        errorCode: "MISSING_PUBLIC_ID"
    },

    // Upload/Multer
    INVALID_IMAGE_FORMAT: {
        status: 400,
        message: 'Chỉ được phép upload ảnh JPG/PNG/WEBP',
        errorCode: "INVALID_IMAGE_FORMAT"
    },
    INVALID_DOC_FORMAT: {
        status: 415,
        message: 'Định dạng tệp không được hỗ trợ',
        errorCode: "INVALID_DOC_FORMAT"
    },
    LIMIT_FILE_SIZE: {
        status: 400,
        message: 'File quá lớn. Vượt quá giới hạn cho phép',
        errorCode: "LIMIT_FILE_SIZE"
    },
    LIMIT_FILE_COUNT: {
        status: 400,
        message: 'Vượt quá giới hạn số lượng file',
        errorCode: "LIMIT_FILE_COUNT"
    },
    LIMIT_UNEXPECTED_FILE: {
        status: 400,
        message: 'Sai tên field form-data' ,
        errorCode: "LIMIT_UNEXPECTED_FILE"
    },


    // Cloudinary
    CLOUDINARY_UPLOAD_FAILED: {
        status: 502,
        message: 'Upload thất bại, vui lòng thử lại',
        errorCode: "CLOUDINARY_UPLOAD_FAILED"
    },
    CLOUDINARY_DELETE_FAILED: {
        status: 502,
        message: 'Xóa thất bại, vui lòng thử lại',
        errorCode: "CLOUDINARY_DELETE_FAILED"
    },
    CLOUDINARY_NOT_FOUND: {
        status: 404,
        message: 'Không tìm thấy ảnh',
        errorCode: "CLOUDINARY_NOT_FOUND"
    },

    // Auth
    UNAUTHORIZED: {
        status: 401,
        message: 'Chưa đăng nhập' ,
        errorCode: "UNAUTHORIZED"
    },
    FORBIDDEN: {
        status: 403,
        message: 'Không có quyền truy cập' ,
        errorCode: "FORBIDDEN"
    },

    // System
    INTERNAL_ERROR: {
        status: 500,
        message: 'Lỗi máy chủ nội bộ',
        errorCode: "INTERNAL_ERROR"
    },
};