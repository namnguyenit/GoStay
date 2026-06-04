"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catalogPoolProvider = exports.CATALOG_POOL = void 0;
const config_1 = require("@nestjs/config");
const pg_1 = require("pg");
exports.CATALOG_POOL = 'CATALOG_POOL';
exports.catalogPoolProvider = {
    provide: exports.CATALOG_POOL,
    inject: [config_1.ConfigService],
    useFactory: (configService) => {
        return new pg_1.Pool({
            host: configService.get('CATALOG_DB_HOST'),
            port: configService.get('CATALOG_DB_PORT'),
            database: configService.get('CATALOG_DB_NAME'),
            user: configService.get('CATALOG_DB_USER'),
            password: configService.get('CATALOG_DB_PASSWORD'),
        });
    },
};
//# sourceMappingURL=catalog-read.pool.js.map