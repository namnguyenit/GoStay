"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    const logger = app.get(nestjs_pino_1.Logger);
    app.useLogger(logger);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT') || 8086;
    app.enableCors();
    await app.listen(port);
    logger.log(`Search & Recommendation Service is running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map