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
var RecommendationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationService = void 0;
const common_1 = require("@nestjs/common");
const redis_cache_service_1 = require("../cache/redis-cache.service");
const candidate_generator_1 = require("./candidate-generator");
const diversity_service_1 = require("./diversity.service");
const scoring_service_1 = require("./scoring.service");
let RecommendationService = RecommendationService_1 = class RecommendationService {
    candidateGenerator;
    scoringService;
    diversityService;
    cacheService;
    logger = new common_1.Logger(RecommendationService_1.name);
    constructor(candidateGenerator, scoringService, diversityService, cacheService) {
        this.candidateGenerator = candidateGenerator;
        this.scoringService = scoringService;
        this.diversityService = diversityService;
        this.cacheService = cacheService;
    }
    async getHeroLandmarks() {
        const cacheKey = 'home:hero-landmarks:v1';
        const cached = await this.cacheService.get(cacheKey);
        if (cached)
            return cached;
        const data = await this.candidateGenerator.getHeroLandmarks(6);
        await this.cacheService.set(cacheKey, data, 3600);
        return data;
    }
    async getHomeFeed(dto) {
        const latValue = dto.lat === undefined ? undefined : Number(dto.lat);
        const lngValue = dto.lng === undefined ? undefined : Number(dto.lng);
        const hasCoordinates = Number.isFinite(latValue) && Number.isFinite(lngValue);
        const lat = hasCoordinates ? latValue.toFixed(2) : 'none';
        const lng = hasCoordinates ? lngValue.toFixed(2) : 'none';
        const cat = dto.category || 'ALL';
        const cursor = dto.cursor || '0';
        const cacheKey = `home:feed:${lat}:${lng}:${cat}:${cursor}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached)
            return cached;
        let candidates;
        let featuredLandmarks = [];
        if (hasCoordinates) {
            candidates = await this.candidateGenerator.generateByCoordinate(latValue, lngValue, 20000, 50, dto.category);
        }
        else {
            if (cat === 'ALL') {
                featuredLandmarks = await this.candidateGenerator.getHeroLandmarks(6);
            }
            candidates = await this.candidateGenerator.generateForHome(undefined, 50, dto.category);
        }
        const scored = this.scoringService.score(candidates, {
            targetCategory: cat === 'ALL' ? undefined : cat,
        });
        const ranked = this.diversityService.diversifyAndRank(scored, 20);
        const sections = [];
        if (!hasCoordinates && featuredLandmarks.length > 0) {
            sections.push({
                type: 'FEATURED_LANDMARKS',
                title: 'Địa danh nổi bật tại Việt Nam',
                items: featuredLandmarks,
            });
        }
        sections.push({
            type: 'LISTING_CAROUSEL',
            title: hasCoordinates ? 'Gợi ý quanh bạn' : 'Gợi ý nổi bật',
            items: ranked,
        });
        const response = {
            cursor: 'next-page',
            nextCursor: null,
            sections,
        };
        await this.cacheService.set(cacheKey, response, 300);
        return response;
    }
    async getProvinces() {
        return this.candidateGenerator.getProvinces();
    }
    async getProvinceDestinations(province) {
        const cacheKey = `province:destinations:${province}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached)
            return cached;
        const data = await this.candidateGenerator.generateProvinceDestinations(province, 24);
        await this.cacheService.set(cacheKey, data, 3600);
        return data;
    }
    async getComplexes(limit = 120) {
        const safeLimit = Number.isFinite(limit)
            ? Math.max(1, Math.min(Math.floor(limit), 200))
            : 120;
        const cacheKey = `recommend:complexes:limit:${safeLimit}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached)
            return cached;
        const data = await this.candidateGenerator.generateComplexes(safeLimit);
        await this.cacheService.set(cacheKey, data, 300);
        return data;
    }
    async recommendByComplex(complexId) {
        const cacheKey = `recommend:complex:${complexId}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached)
            return cached;
        const candidates = await this.candidateGenerator.generateByComplex(complexId);
        const scored = this.scoringService.score(candidates, { complexId });
        const finalRanked = this.diversityService.diversifyAndRank(scored, 15);
        await this.cacheService.set(cacheKey, finalRanked, 300);
        return finalRanked;
    }
    async recommendNearby(lat, lng, category) {
        return this.getHomeFeed({ lat: Number(lat), lng: Number(lng), category });
    }
    async recommendForHome(province) {
        return this.candidateGenerator.generateForHome(province, 20);
    }
    async recommendByLandmark(landmarkId) {
        return this.recommendByLandmarkGrouped(landmarkId, 5000);
    }
    async recommendByLandmarkGrouped(landmarkId, radiusMeters = 5000) {
        const safeRadiusMeters = Number.isFinite(radiusMeters) && radiusMeters > 0 ? radiusMeters : 5000;
        const cacheKey = `recommend:landmark:${landmarkId}:radius:${safeRadiusMeters}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached)
            return cached;
        const [candidates, complexes] = await Promise.all([
            this.candidateGenerator.generateByLandmark(landmarkId, 200, safeRadiusMeters),
            this.candidateGenerator.generateComplexesByLandmark(landmarkId, safeRadiusMeters, 12),
        ]);
        const scored = this.scoringService.score(candidates, {});
        const finalRanked = this.diversityService.diversifyAndRank(scored, 15);
        const grouped = {
            radiusMeters: safeRadiusMeters,
            total: finalRanked.length,
            STAY: finalRanked.filter((item) => item.category === 'STAY'),
            EXP: finalRanked.filter((item) => item.category === 'EXP'),
            SVC: finalRanked.filter((item) => item.category === 'SVC'),
            COMPLEX: complexes,
        };
        await this.cacheService.set(cacheKey, grouped, 300);
        return grouped;
    }
    async recommendSimilar(listingId) {
        const cacheKey = `recommend:similar:${listingId}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached)
            return cached;
        const candidates = await this.candidateGenerator.generateSimilar(listingId);
        const scored = this.scoringService.score(candidates, {});
        const finalRanked = this.diversityService.diversifyAndRank(scored, 10);
        await this.cacheService.set(cacheKey, finalRanked, 300);
        return finalRanked;
    }
};
exports.RecommendationService = RecommendationService;
exports.RecommendationService = RecommendationService = RecommendationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [candidate_generator_1.CandidateGenerator,
        scoring_service_1.ScoringService,
        diversity_service_1.DiversityService,
        redis_cache_service_1.RedisCacheService])
], RecommendationService);
//# sourceMappingURL=recommendation.service.js.map