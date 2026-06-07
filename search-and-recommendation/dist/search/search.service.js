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
var SearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const redis_cache_service_1 = require("../cache/redis-cache.service");
const inventory_client_1 = require("../inventory/inventory.client");
const location_resolver_1 = require("./location-resolver");
const landmark_repository_1 = require("./repositories/landmark.repository");
const listing_repository_1 = require("./repositories/listing.repository");
const search_dto_1 = require("./search.dto");
let SearchService = SearchService_1 = class SearchService {
    listingRepo;
    landmarkRepo;
    locationResolver;
    inventoryClient;
    cacheService;
    logger = new common_1.Logger(SearchService_1.name);
    constructor(listingRepo, landmarkRepo, locationResolver, inventoryClient, cacheService) {
        this.listingRepo = listingRepo;
        this.landmarkRepo = landmarkRepo;
        this.locationResolver = locationResolver;
        this.inventoryClient = inventoryClient;
        this.cacheService = cacheService;
    }
    getTodayIso() {
        const now = new Date();
        const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
        return local.toISOString().slice(0, 10);
    }
    async suggestLocations(query) {
        if (!query)
            return [];
        const normalizedQuery = query.toLowerCase().trim();
        const cacheKey = `autocomplete:locations:${normalizedQuery}:limit15`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            this.logger.debug(`[Cache HIT] autocomplete ${cacheKey}`);
            return cached;
        }
        this.logger.debug(`[Cache MISS] autocomplete ${cacheKey}`);
        const startTime = Date.now();
        const results = await this.locationResolver.suggestLocations(query);
        this.logger.debug(`DB Query duration (autocomplete): ${Date.now() - startTime}ms`);
        await this.cacheService.set(cacheKey, results, 300);
        return results;
    }
    async searchListings(dto) {
        const dtoHash = (0, crypto_1.createHash)('md5').update(JSON.stringify(dto)).digest('hex');
        const cacheKey = `search:listings:${dtoHash}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            this.logger.debug(`[Cache HIT] search ${cacheKey}`);
            return cached;
        }
        this.logger.debug(`[Cache MISS] search ${cacheKey}`);
        let lat = dto.lat;
        let lng = dto.lng;
        let radiusMeters = dto.radiusMeters || 5000;
        const category = dto.category || search_dto_1.CategoryMode.ALL;
        const keyword = dto.q?.trim();
        let province;
        let complexId;
        const hasBbox = dto.minLat !== undefined &&
            dto.maxLat !== undefined &&
            dto.minLng !== undefined &&
            dto.maxLng !== undefined;
        if (lat == null && lng == null && dto.locationQuery) {
            const resolved = await this.locationResolver.resolveLocation(dto.locationQuery);
            if (resolved?.resolvedType === 'PROVINCE') {
                province = resolved.province;
            }
            else if (resolved?.resolvedType === 'COMPLEX') {
                complexId = resolved.complexId;
                lat = resolved.latitude;
                lng = resolved.longitude;
            }
            else if (resolved && resolved.latitude && resolved.longitude) {
                lat = resolved.latitude;
                lng = resolved.longitude;
                radiusMeters = resolved.radiusMeters || radiusMeters;
            }
        }
        if (lat == null && lng == null && dto.landmarkId) {
            const landmark = await this.landmarkRepo.findById(dto.landmarkId);
            if (landmark) {
                lat = landmark.latitude;
                lng = landmark.longitude;
                radiusMeters = landmark.radius_meters || radiusMeters;
                province = landmark.province || province;
            }
        }
        const hasCoordinates = lat != null && lng != null;
        const hasKeyword = Boolean(keyword);
        const hasResolvedFilter = Boolean(province || complexId);
        const canBrowseByCategory = !hasCoordinates && category !== search_dto_1.CategoryMode.ALL;
        if (!hasCoordinates &&
            !hasBbox &&
            !canBrowseByCategory &&
            !hasKeyword &&
            !hasResolvedFilter) {
            return {
                mode: category === search_dto_1.CategoryMode.ALL ? 'GROUPED' : 'MIXED',
                data: [],
                total: 0,
                message: 'No coordinates found for the search context',
            };
        }
        const startTime = Date.now();
        const candidates = await this.listingRepo.search({
            ...(hasCoordinates ? { lat, lng, radiusMeters } : {}),
            ...(hasBbox
                ? {
                    minLat: dto.minLat,
                    maxLat: dto.maxLat,
                    minLng: dto.minLng,
                    maxLng: dto.maxLng,
                }
                : {}),
            q: keyword,
            province,
            complexId,
            category,
            limit: dto.limit || 20,
            offset: dto.offset || 0,
            minPrice: dto.minPrice,
            maxPrice: dto.maxPrice,
            minRating: dto.minRating,
            amenities: dto.amenities ? dto.amenities.split(',') : undefined,
            sortBy: dto.sortBy,
        });
        this.logger.debug(`DB Query duration (search): ${Date.now() - startTime}ms, found ${candidates.length} items.`);
        let finalItems = candidates;
        const availabilityStart = dto.checkIn || this.getTodayIso();
        const availabilityEnd = dto.checkOut || availabilityStart;
        if (availabilityStart && availabilityEnd) {
            const listingIds = candidates.map((c) => c.id);
            if (listingIds.length > 0) {
                try {
                    const invStartTime = Date.now();
                    const inventoryRes = await this.inventoryClient.checkBatchAvailability({
                        listingIds,
                        startDate: availabilityStart,
                        endDate: availabilityEnd,
                        requiredQuantity: dto.guests || 1,
                    });
                    this.logger.debug(`Inventory check duration: ${Date.now() - invStartTime}ms`);
                    const availableSet = new Set(inventoryRes.availableListingIds || []);
                    finalItems = candidates
                        .filter((c) => availableSet.has(c.id))
                        .map((c) => ({
                        ...c,
                        isAvailable: true,
                    }));
                }
                catch (e) {
                    this.logger.error('Inventory client check failed, returning no date-filtered listings', e);
                    finalItems = [];
                }
            }
        }
        let result;
        if (category === search_dto_1.CategoryMode.ALL) {
            result = {
                mode: 'GROUPED',
                data: [
                    {
                        sectionTitle: 'Nơi lưu trú',
                        category: 'STAY',
                        items: finalItems.filter((i) => i.category === 'STAY'),
                    },
                    {
                        sectionTitle: 'Trải nghiệm',
                        category: 'EXP',
                        items: finalItems.filter((i) => i.category === 'EXP'),
                    },
                    {
                        sectionTitle: 'Dịch vụ',
                        category: 'SVC',
                        items: finalItems.filter((i) => i.category === 'SVC'),
                    },
                ],
                total: finalItems.length,
            };
        }
        else {
            result = {
                mode: 'MIXED',
                data: finalItems,
                total: finalItems.length,
            };
        }
        await this.cacheService.set(cacheKey, result, 60);
        return result;
    }
    async searchMap(dto) {
        const result = await this.searchListings(dto);
        const items = result.mode === 'GROUPED'
            ? result.data.flatMap((section) => section.items || [])
            : result.data || [];
        const data = items
            .filter((item) => item.latitude != null && item.longitude != null)
            .map((item) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            latitude: item.latitude,
            longitude: item.longitude,
            price: item.basePrice,
            priceUnit: item.priceUnit,
            averageRating: item.averageRating,
            thumbnailUrl: item.thumbnailUrl,
            complexId: item.complexId || item.complex_id,
        }));
        return {
            mode: 'MAP',
            total: data.length,
            data,
        };
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = SearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [listing_repository_1.ListingRepository,
        landmark_repository_1.LandmarkRepository,
        location_resolver_1.LocationResolver,
        inventory_client_1.InventoryClient,
        redis_cache_service_1.RedisCacheService])
], SearchService);
//# sourceMappingURL=search.service.js.map