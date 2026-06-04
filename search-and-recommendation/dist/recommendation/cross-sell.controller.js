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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossSellController = void 0;
const common_1 = require("@nestjs/common");
const recommendation_dto_1 = require("./recommendation.dto");
const cross_sell_service_1 = require("./cross-sell.service");
let CrossSellController = class CrossSellController {
    crossSellService;
    constructor(crossSellService) {
        this.crossSellService = crossSellService;
    }
    async recommendForCartItem(dto) {
        return this.crossSellService.recommendForCartItem(dto);
    }
};
exports.CrossSellController = CrossSellController;
__decorate([
    (0, common_1.Post)('cart-item'),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [recommendation_dto_1.CrossSellRequestDto]),
    __metadata("design:returntype", Promise)
], CrossSellController.prototype, "recommendForCartItem", null);
exports.CrossSellController = CrossSellController = __decorate([
    (0, common_1.Controller)('api/v1/recommendations/cross-sell'),
    __metadata("design:paramtypes", [cross_sell_service_1.CrossSellService])
], CrossSellController);
//# sourceMappingURL=cross-sell.controller.js.map