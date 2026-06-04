"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.envValidationSchema = void 0;
const Joi = __importStar(require("joi"));
exports.envValidationSchema = Joi.object({
    PORT: Joi.number().default(8086),
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    CATALOG_DB_HOST: Joi.string().required(),
    CATALOG_DB_PORT: Joi.number().default(5432),
    CATALOG_DB_NAME: Joi.string().required(),
    CATALOG_DB_USER: Joi.string().required(),
    CATALOG_DB_PASSWORD: Joi.string().required(),
    RECOMMENDATION_DB_HOST: Joi.string().required(),
    RECOMMENDATION_DB_PORT: Joi.number().default(5432),
    RECOMMENDATION_DB_NAME: Joi.string().required(),
    RECOMMENDATION_DB_USER: Joi.string().required(),
    RECOMMENDATION_DB_PASSWORD: Joi.string().required(),
    REDIS_URL: Joi.string().required(),
    INVENTORY_SERVICE_URL: Joi.string().uri().required(),
    INTERNAL_SERVICE_TOKEN: Joi.string().required(),
});
//# sourceMappingURL=env.config.js.map