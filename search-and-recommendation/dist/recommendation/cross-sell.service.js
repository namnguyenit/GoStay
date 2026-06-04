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
var CrossSellService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossSellService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const redis_cache_service_1 = require("../cache/redis-cache.service");
const inventory_client_1 = require("../inventory/inventory.client");
const candidate_generator_1 = require("./candidate-generator");
const diversity_service_1 = require("./diversity.service");
const scoring_service_1 = require("./scoring.service");
let CrossSellService = CrossSellService_1 = class CrossSellService {
    candidateGenerator;
    scoringService;
    diversityService;
    cacheService;
    inventoryClient;
    logger = new common_1.Logger(CrossSellService_1.name);
    constructor(candidateGenerator, scoringService, diversityService, cacheService, inventoryClient) {
        this.candidateGenerator = candidateGenerator;
        this.scoringService = scoringService;
        this.diversityService = diversityService;
        this.cacheService = cacheService;
        this.inventoryClient = inventoryClient;
    }
    async recommendForCartItem(dto) {
        const hash = (0, crypto_1.createHash)('md5').update(JSON.stringify(dto)).digest('hex');
        const cacheKey = `cross-sell:${hash}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached)
            return cached;
        const candidates = await this.candidateGenerator.generateCrossSell(dto.sourceListingId, dto.cartListingIds, 50);
        const scored = this.scoringService.score(candidates, {});
        let finalRanked = this.diversityService.diversifyAndRank(scored, dto.limit || 5);
        try {
            const listingIds = finalRanked.map((candidate) => candidate.id);
            if (listingIds.length > 0) {
                const inventoryRes = await this.inventoryClient.checkBatchAvailability({
                    listingIds,
                    startDate: dto.checkIn,
                    endDate: dto.checkOut,
                    requiredQuantity: dto.guests || 1,
                });
                const availableSet = new Set(inventoryRes.availableListingIds || []);
                finalRanked = finalRanked.filter((candidate) => availableSet.has(candidate.id));
            }
        }
        catch (error) {
            this.logger.error('Cross-sell inventory check failed, returning no cross-sell items', error);
            finalRanked = [];
        }
        await this.cacheService.set(cacheKey, finalRanked, 60);
        return finalRanked;
    }
};
exports.CrossSellService = CrossSellService;
exports.CrossSellService = CrossSellService = CrossSellService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [candidate_generator_1.CandidateGenerator,
        scoring_service_1.ScoringService,
        diversity_service_1.DiversityService,
        redis_cache_service_1.RedisCacheService,
        inventory_client_1.InventoryClient])
], CrossSellService);
//# sourceMappingURL=cross-sell.service.js.map