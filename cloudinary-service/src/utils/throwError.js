import { ERROR_CODES } from '../constants/error_code.js';

/** @typedef {keyof typeof ERROR_CODES} ErrorCode */

/** @param {ErrorCode} code */
export const throwError = (code) => {
    const err = new Error(code);
    err.code = code;
    return err;
};