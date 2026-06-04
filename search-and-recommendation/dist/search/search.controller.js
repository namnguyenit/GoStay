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
exports.SearchController = void 0;
const common_1 = require("@nestjs/common");
const search_dto_1 = require("./search.dto");
const search_service_1 = require("./search.service");
let SearchController = class SearchController {
    searchService;
    constructor(searchService) {
        this.searchService = searchService;
    }
    async suggestLocations(query) {
        return this.searchService.suggestLocations(query);
    }
    async autocompleteLandmarks(query) {
        return this.searchService.suggestLocations(query);
    }
    async searchListings(dto) {
        return this.searchService.searchListings(dto);
    }
    async searchNearby(dto) {
        if (!dto.radiusMeters)
            dto.radiusMeters = 3000;
        return this.searchService.searchListings(dto);
    }
    async searchMap(dto) {
        return this.searchService.searchMap(dto);
    }
};
exports.SearchController = SearchController;
__decorate([
    (0, common_1.Get)('locations/suggest'),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "suggestLocations", null);
__decorate([
    (0, common_1.Get)('landmarks/autocomplete'),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "autocompleteLandmarks", null);
__decorate([
    (0, common_1.Get)('listings'),
    __param(0, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_dto_1.SearchQueryDto]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchListings", null);
__decorate([
    (0, common_1.Get)('listings/nearby'),
    __param(0, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_dto_1.SearchQueryDto]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchNearby", null);
__decorate([
    (0, common_1.Get)('map'),
    __param(0, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_dto_1.SearchQueryDto]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchMap", null);
exports.SearchController = SearchController = __decorate([
    (0, common_1.Controller)('api/v1/search'),
    __metadata("design:paramtypes", [search_service_1.SearchService])
], SearchController);
//# sourceMappingURL=search.controller.js.map