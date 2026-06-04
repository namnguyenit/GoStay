"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const cache_module_1 = require("./cache/cache.module");
const env_config_1 = require("./config/env.config");
const database_module_1 = require("./database/database.module");
const behavior_module_1 = require("./behavior/behavior.module");
const health_module_1 = require("./health/health.module");
const inventory_module_1 = require("./inventory/inventory.module");
const recommendation_module_1 = require("./recommendation/recommendation.module");
const search_module_1 = require("./search/search.module");
const nestjs_prometheus_1 = require("@willsoto/nestjs-prometheus");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validationSchema: env_config_1.envValidationSchema,
            }),
            nestjs_pino_1.LoggerModule.forRoot({
                pinoHttp: {
                    transport: {
                        target: 'pino-pretty',
                        options: {
                            singleLine: true,
                        },
                    },
                },
            }),
            nestjs_prometheus_1.PrometheusModule.register({
                defaultMetrics: {
                    enabled: true,
                },
            }),
            database_module_1.DatabaseModule,
            cache_module_1.CacheModule,
            inventory_module_1.InventoryModule,
            health_module_1.HealthModule,
            search_module_1.SearchModule,
            recommendation_module_1.RecommendationModule,
            behavior_module_1.BehaviorModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map