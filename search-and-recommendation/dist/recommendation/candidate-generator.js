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
exports.CandidateGenerator = void 0;
const common_1 = require("@nestjs/common");
const complex_repository_1 = require("../search/repositories/complex.repository");
const landmark_repository_1 = require("../search/repositories/landmark.repository");
const listing_repository_1 = require("../search/repositories/listing.repository");
let CandidateGenerator = class CandidateGenerator {
    listingRepo;
    landmarkRepo;
    complexRepo;
    constructor(listingRepo, landmarkRepo, complexRepo) {
        this.listingRepo = listingRepo;
        this.landmarkRepo = landmarkRepo;
        this.complexRepo = complexRepo;
    }
    async generateByCoordinate(lat, lng, radiusMeters = 10000, limit = 200, category = 'ALL') {
        return this.listingRepo.search({
            lat,
            lng,
            radiusMeters,
            category,
            limit,
            offset: 0,
        });
    }
    async generateForHome(province, limit = 200, category = 'ALL') {
        return this.listingRepo.search({
            category,
            province,
            limit,
            offset: 0,
            sortBy: 'RELEVANCE',
        });
    }
    async generateByLandmark(landmarkId, limit = 200, radiusMeters = 5000) {
        const landmark = await this.landmarkRepo.findById(landmarkId);
        if (!landmark)
            return [];
        return this.generateByCoordinate(landmark.latitude, landmark.longitude, radiusMeters, limit);
    }
    async generateByComplex(complexId, limit = 200) {
        return this.listingRepo.search({
            category: 'ALL',
            complexId,
            limit,
            offset: 0,
            sortBy: 'RELEVANCE',
        });
    }
    async generateSimilar(listingId, limit = 50) {
        const listing = await this.listingRepo.findById(listingId);
        if (!listing)
            return [];
        const radiusMeters = 5000;
        const minPrice = listing.base_price * 0.5;
        const maxPrice = listing.base_price * 1.5;
        const candidates = await this.listingRepo.search({
            lat: listing.latitude,
            lng: listing.longitude,
            radiusMeters,
            category: listing.category,
            minPrice,
            maxPrice,
            limit,
            offset: 0,
        });
        return candidates.filter((c) => c.id !== listingId);
    }
    async generateCrossSell(sourceListingId, cartIds = [], limit = 50) {
        const listing = await this.listingRepo.findById(sourceListingId);
        if (!listing)
            return [];
        const candidates = await this.listingRepo.search({
            lat: listing.latitude,
            lng: listing.longitude,
            radiusMeters: 15000,
            category: 'ALL',
            limit,
            offset: 0,
        });
        const set = new Set(cartIds);
        set.add(sourceListingId);
        return candidates.filter((c) => !set.has(c.id) && c.category !== listing.category);
    }
    async getHeroLandmarks(limit = 6) {
        return this.landmarkRepo.findFeatured(limit);
    }
    async getProvinces() {
        const [landmarkProvinces, complexProvinces] = await Promise.all([
            this.landmarkRepo.findPopularProvinces(50),
            this.complexRepo.findProvinceCounts(50),
        ]);
        const merged = new Map();
        for (const province of landmarkProvinces) {
            merged.set(province.name, {
                ...province,
                complexCount: 0,
            });
        }
        for (const province of complexProvinces) {
            const current = merged.get(province.name) || {
                id: province.name,
                name: province.name,
                code: province.name,
                landmarkCount: 0,
                featuredLandmarkCount: 0,
            };
            merged.set(province.name, {
                ...current,
                complexCount: Number(province.complexCount || 0),
            });
        }
        return Array.from(merged.values())
            .sort((a, b) => {
            const aTotal = (a.landmarkCount || 0) + (a.complexCount || 0);
            const bTotal = (b.landmarkCount || 0) + (b.complexCount || 0);
            return ((b.featuredLandmarkCount || 0) - (a.featuredLandmarkCount || 0) ||
                bTotal - aTotal ||
                String(a.name).localeCompare(String(b.name)));
        })
            .slice(0, 20)
            .map((province, index) => ({
            ...province,
            rank: index + 1,
        }));
    }
    async generateProvinceDestinations(province, limit = 24) {
        const perTypeLimit = Math.max(1, Math.ceil(limit / 2));
        const [landmarks, complexes] = await Promise.all([
            this.landmarkRepo.findByProvince(province, perTypeLimit),
            this.complexRepo.findByProvince(province, perTypeLimit),
        ]);
        return [
            ...landmarks.map((item) => ({
                ...item,
                type: 'LANDMARK',
                destinationType: 'LANDMARK',
            })),
            ...complexes.map((item) => ({
                ...item,
                type: 'COMPLEX',
                destinationType: 'COMPLEX',
            })),
        ].slice(0, limit);
    }
};
exports.CandidateGenerator = CandidateGenerator;
exports.CandidateGenerator = CandidateGenerator = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [listing_repository_1.ListingRepository,
        landmark_repository_1.LandmarkRepository,
        complex_repository_1.ComplexRepository])
], CandidateGenerator);
//# sourceMappingURL=candidate-generator.js.map