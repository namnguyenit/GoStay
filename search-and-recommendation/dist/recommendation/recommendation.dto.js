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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NearbyRecommendationQueryDto = exports.HomeFeedQueryDto = exports.CrossSellRequestDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const search_dto_1 = require("../search/search.dto");
class CrossSellRequestDto {
    sourceListingId;
    sourceCategory;
    checkIn;
    checkOut;
    guests;
    cartListingIds;
    limit = 5;
}
exports.CrossSellRequestDto = CrossSellRequestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrossSellRequestDto.prototype, "sourceListingId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrossSellRequestDto.prototype, "sourceCategory", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrossSellRequestDto.prototype, "checkIn", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrossSellRequestDto.prototype, "checkOut", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CrossSellRequestDto.prototype, "guests", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CrossSellRequestDto.prototype, "cartListingIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CrossSellRequestDto.prototype, "limit", void 0);
class HomeFeedQueryDto {
    lat;
    lng;
    category = search_dto_1.CategoryMode.ALL;
    cursor;
}
exports.HomeFeedQueryDto = HomeFeedQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsLatitude)(),
    __metadata("design:type", Number)
], HomeFeedQueryDto.prototype, "lat", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsLongitude)(),
    __metadata("design:type", Number)
], HomeFeedQueryDto.prototype, "lng", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(search_dto_1.CategoryMode),
    __metadata("design:type", String)
], HomeFeedQueryDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HomeFeedQueryDto.prototype, "cursor", void 0);
class NearbyRecommendationQueryDto {
    lat;
    lng;
    category = search_dto_1.CategoryMode.ALL;
}
exports.NearbyRecommendationQueryDto = NearbyRecommendationQueryDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsLatitude)(),
    __metadata("design:type", Number)
], NearbyRecommendationQueryDto.prototype, "lat", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsLongitude)(),
    __metadata("design:type", Number)
], NearbyRecommendationQueryDto.prototype, "lng", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(search_dto_1.CategoryMode),
    __metadata("design:type", String)
], NearbyRecommendationQueryDto.prototype, "category", void 0);
//# sourceMappingURL=recommendation.dto.js.map