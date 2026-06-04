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
var LocationResolver_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationResolver = void 0;
const common_1 = require("@nestjs/common");
const complex_repository_1 = require("./repositories/complex.repository");
const landmark_repository_1 = require("./repositories/landmark.repository");
let LocationResolver = LocationResolver_1 = class LocationResolver {
    landmarkRepo;
    complexRepo;
    logger = new common_1.Logger(LocationResolver_1.name);
    constructor(landmarkRepo, complexRepo) {
        this.landmarkRepo = landmarkRepo;
        this.complexRepo = complexRepo;
    }
    async suggestLocations(query) {
        if (!query) {
            return [];
        }
        try {
            const [landmarks, complexes, provinces] = await Promise.all([
                this.landmarkRepo.autocomplete(query, 5),
                this.complexRepo.autocomplete(query, 5),
                this.landmarkRepo.findProvinceSuggestions(query, 5),
            ]);
            return [
                ...landmarks.map((item) => ({
                    type: 'LANDMARK',
                    id: item.id,
                    name: item.name,
                    province: item.province,
                    latitude: item.latitude,
                    longitude: item.longitude,
                    radiusMeters: item.radiusMeters,
                    thumbnailUrl: item.thumbnailUrl,
                    textScore: item.textScore || 0,
                    priority: 3,
                })),
                ...complexes.map((item) => ({
                    type: 'COMPLEX',
                    id: item.id,
                    name: item.name,
                    province: item.province,
                    latitude: item.latitude,
                    longitude: item.longitude,
                    thumbnailUrl: item.thumbnailUrl,
                    textScore: item.textScore || 0,
                    priority: 2,
                })),
                ...provinces.map((item) => ({
                    type: 'PROVINCE',
                    name: item.name,
                    province: item.name,
                    textScore: item.textScore || 0,
                    priority: 1,
                })),
            ].sort((a, b) => (b.textScore - a.textScore) || (b.priority - a.priority));
        }
        catch (error) {
            this.logger.error(`Error suggesting locations: ${error.message}`);
            return [];
        }
    }
    async resolveLocation(query) {
        if (!query) {
            return null;
        }
        try {
            const suggestions = await this.suggestLocations(query);
            if (suggestions.length === 0) {
                return null;
            }
            const topMatch = suggestions[0];
            if (topMatch.type === 'PROVINCE') {
                return {
                    resolvedType: 'PROVINCE',
                    province: topMatch.province,
                    suggestions,
                };
            }
            if (topMatch.type === 'COMPLEX') {
                return {
                    resolvedType: 'COMPLEX',
                    complexId: topMatch.id,
                    latitude: topMatch.latitude,
                    longitude: topMatch.longitude,
                    province: topMatch.province,
                    suggestions,
                };
            }
            return {
                resolvedType: 'LANDMARK',
                landmarkId: topMatch.id,
                latitude: topMatch.latitude,
                longitude: topMatch.longitude,
                radiusMeters: topMatch.radiusMeters,
                province: topMatch.province,
                suggestions,
            };
        }
        catch (error) {
            this.logger.error(`Error resolving location: ${error.message}`);
            return null;
        }
    }
};
exports.LocationResolver = LocationResolver;
exports.LocationResolver = LocationResolver = LocationResolver_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [landmark_repository_1.LandmarkRepository,
        complex_repository_1.ComplexRepository])
], LocationResolver);
//# sourceMappingURL=location-resolver.js.map