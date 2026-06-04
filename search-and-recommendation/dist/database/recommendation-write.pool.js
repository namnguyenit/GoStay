"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendationPoolProvider = exports.RECOMMENDATION_POOL = void 0;
const config_1 = require("@nestjs/config");
const pg_1 = require("pg");
exports.RECOMMENDATION_POOL = 'RECOMMENDATION_POOL';
exports.recommendationPoolProvider = {
    provide: exports.RECOMMENDATION_POOL,
    inject: [config_1.ConfigService],
    useFactory: (configService) => {
        return new pg_1.Pool({
            host: configService.get('RECOMMENDATION_DB_HOST'),
            port: configService.get('RECOMMENDATION_DB_PORT'),
            database: configService.get('RECOMMENDATION_DB_NAME'),
            user: configService.get('RECOMMENDATION_DB_USER'),
            password: configService.get('RECOMMENDATION_DB_PASSWORD'),
        });
    },
};
//# sourceMappingURL=recommendation-write.pool.js.map