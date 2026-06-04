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
exports.BehaviorController = void 0;
const common_1 = require("@nestjs/common");
const behavior_dto_1 = require("./behavior.dto");
const behavior_service_1 = require("./behavior.service");
let BehaviorController = class BehaviorController {
    behaviorService;
    constructor(behaviorService) {
        this.behaviorService = behaviorService;
    }
    async trackEvent(dto) {
        return this.behaviorService.trackEvent(dto);
    }
};
exports.BehaviorController = BehaviorController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [behavior_dto_1.TrackEventDto]),
    __metadata("design:returntype", Promise)
], BehaviorController.prototype, "trackEvent", null);
exports.BehaviorController = BehaviorController = __decorate([
    (0, common_1.Controller)('api/v1/recommendations/events'),
    __metadata("design:paramtypes", [behavior_service_1.BehaviorService])
], BehaviorController);
//# sourceMappingURL=behavior.controller.js.map