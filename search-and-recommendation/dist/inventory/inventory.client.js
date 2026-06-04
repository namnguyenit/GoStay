"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var InventoryClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryClient = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let InventoryClient = InventoryClient_1 = class InventoryClient {
    httpService;
    configService;
    logger = new common_1.Logger(InventoryClient_1.name);
    baseUrl;
    internalToken;
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.baseUrl = this.configService.get('INVENTORY_SERVICE_URL');
        this.internalToken = this.configService.get('INTERNAL_SERVICE_TOKEN');
    }
    async checkBatchAvailability(payload) {
        try {
            const url = `${this.baseUrl}/api/v1/internal/inventory/batch-check-availability`;
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload, {
                headers: {
                    'X-Internal-Service-Token': this.internalToken,
                },
                timeout: 1000,
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to check batch availability: ${error.message}`);
            return { availableListingIds: [] };
        }
    }
};
exports.InventoryClient = InventoryClient;
exports.InventoryClient = InventoryClient = InventoryClient_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], InventoryClient);
//# sourceMappingURL=inventory.client.js.map