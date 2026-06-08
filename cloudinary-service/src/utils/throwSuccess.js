import { SUCCESS_CODE } from '../constants/success-code.js';

export const buildSuccess = (codeKey, data) => {
    const def = SUCCESS_CODE[codeKey];
    return {
        status: def.status,
        message: def.message,
        errorCode: def.errorCode,
        data,
    };
};