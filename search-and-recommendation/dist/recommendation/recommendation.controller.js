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
exports.RecommendationController = void 0;
const common_1 = require("@nestjs/common");
const recommendation_service_1 = require("./recommendation.service");
const recommendation_dto_1 = require("./recommendation.dto");
let RecommendationController = class RecommendationController {
    recommendationService;
    constructor(recommendationService) {
        this.recommendationService = recommendationService;
    }
    async getHeroLandmarks() {
        return this.recommendationService.getHeroLandmarks();
    }
    async getHomeFeed(dto) {
        return this.recommendationService.getHomeFeed(dto);
    }
    async getProvinces() {
        return this.recommendationService.getProvinces();
    }
    async getProvinceDestinations(province) {
        return this.recommendationService.getProvinceDestinations(province);
    }
    async getComplexes(limit) {
        const parsedLimit = Number(limit);
        return this.recommendationService.getComplexes(Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 120);
    }
    async getComplexRecommendations(id) {
        return this.recommendationService.recommendByComplex(id);
    }
    async getHomeRecommendations(province) {
        return this.recommendationService.recommendForHome(province);
    }
    async getNearbyRecommendations(dto) {
        return this.recommendationService.getHomeFeed(dto);
    }
    async getByLandmark(landmarkId, radius, radiusMeters) {
        const parsedRadius = Number(radiusMeters ?? radius);
        return this.recommendationService.recommendByLandmarkGrouped(landmarkId, Number.isFinite(parsedRadius) && parsedRadius > 0 ? parsedRadius : 5000);
    }
    async getSimilar(listingId, limit) {
        const parsedLimit = Number(limit);
        return this.recommendationService.recommendSimilar(listingId, Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 30);
    }
};
exports.RecommendationController = RecommendationController;
__decorate([
    (0, common_1.Get)('home/hero-landmarks'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "getHeroLandmarks", null);
__decorate([
    (0, common_1.Get)('home/feed'),
    __param(0, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [recommendation_dto_1.HomeFeedQueryDto]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "getHomeFeed", null);
__decorate([
    (0, common_1.Get)('provinces'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "getProvinces", null);
__decorate([
    (0, common_1.Get)('provinces/:province/destinations'),
    __param(0, (0, common_1.Param)('province')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "getProvinceDestinations", null);
__decorate([
    (0, common_1.Get)('complexes'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "getComplexes", null);
__decorate([
    (0, common_1.Get)('complexes/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "getComplexRecommendations", null);
__decorate([
    (0, common_1.Get)('home'),
    __param(0, (0, common_1.Query)('province')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "getHomeRecommendations", null);
__decorate([
    (0, common_1.Get)('nearby'),
    __param(0, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [recommendation_dto_1.NearbyRecommendationQueryDto]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "getNearbyRecommendations", null);
__decorate([
    (0, common_1.Get)('landmarks/:landmarkId'),
    __param(0, (0, common_1.Param)('landmarkId')),
    __param(1, (0, common_1.Query)('radius')),
    __param(2, (0, common_1.Query)('radiusMeters')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "getByLandmark", null);
__decorate([
    (0, common_1.Get)('listings/:listingId/similar'),
    __param(0, (0, common_1.Param)('listingId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "getSimilar", null);
exports.RecommendationController = RecommendationController = __decorate([
    (0, common_1.Controller)('api/v1/recommendations'),
    __metadata("design:paramtypes", [recommendation_service_1.RecommendationService])
], RecommendationController);
//# sourceMappingURL=recommendation.controller.js.map