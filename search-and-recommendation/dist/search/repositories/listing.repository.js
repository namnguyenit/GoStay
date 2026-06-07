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
var ListingRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingRepository = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
const catalog_read_pool_1 = require("../../database/catalog-read.pool");
const search_dto_1 = require("../search.dto");
let ListingRepository = ListingRepository_1 = class ListingRepository {
    pool;
    logger = new common_1.Logger(ListingRepository_1.name);
    constructor(pool) {
        this.pool = pool;
    }
    async search(params) {
        const { lat, lng, radiusMeters = 5000, category = 'ALL', limit = 20, offset = 0, sortBy = search_dto_1.SortMode.DISTANCE, } = params;
        const keyword = params.q?.trim();
        const hasSpatial = lat !== undefined && lng !== undefined;
        const hasBbox = params.minLat !== undefined &&
            params.maxLat !== undefined &&
            params.minLng !== undefined &&
            params.maxLng !== undefined;
        const hasKeyword = Boolean(keyword);
        try {
            const values = [];
            const conditions = ["l.status = 'ACTIVE'"];
            const ctes = [];
            const joins = [];
            let selectDistance = 'NULL AS "distanceMeters"';
            let selectTextScore = 'NULL::double precision AS "textScore"';
            if (hasSpatial) {
                values.push(lng, lat, radiusMeters);
                ctes.push(`geo AS (SELECT ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography AS point)`);
                joins.push('CROSS JOIN geo');
                conditions.push(`l.location IS NOT NULL`);
                conditions.push(`ST_DWithin(l.location::geography, geo.point, $3)`);
                selectDistance = `ST_Distance(l.location::geography, geo.point) AS "distanceMeters"`;
            }
            if (hasKeyword) {
                values.push(keyword);
                ctes.push(`search_q AS (SELECT public.gostay_normalize_search_text($${values.length}) AS normalized_query)`);
                joins.push('CROSS JOIN search_q');
                conditions.push(`l.title_normalized IS NOT NULL`);
                conditions.push(`(
          l.title_normalized % search_q.normalized_query
          OR l.title_normalized LIKE '%' || search_q.normalized_query || '%'
        )`);
                selectTextScore = `similarity(l.title_normalized, search_q.normalized_query) AS "textScore"`;
            }
            if (hasBbox) {
                const south = Math.min(params.minLat, params.maxLat);
                const north = Math.max(params.minLat, params.maxLat);
                const west = Math.min(params.minLng, params.maxLng);
                const east = Math.max(params.minLng, params.maxLng);
                values.push(south, north, west, east);
                conditions.push(`l.latitude BETWEEN $${values.length - 3} AND $${values.length - 2}`);
                conditions.push(`l.longitude BETWEEN $${values.length - 1} AND $${values.length}`);
                conditions.push(`l.location IS NOT NULL`);
            }
            if (category !== 'ALL') {
                values.push(category);
                conditions.push(`l.category = $${values.length}`);
            }
            if (params.subCategory) {
                const normalizedSubCategory = params.subCategory.startsWith('SVC_')
                    ? params.subCategory.slice(4)
                    : params.subCategory;
                values.push(normalizedSubCategory);
                conditions.push(`l.sub_category = $${values.length}`);
            }
            if (params.province) {
                values.push(params.province);
                conditions.push(`l.province = $${values.length}`);
            }
            if (params.complexId) {
                values.push(params.complexId);
                conditions.push(`l.complex_id = $${values.length}::uuid`);
            }
            if (params.minPrice !== undefined) {
                values.push(params.minPrice);
                conditions.push(`l.base_price >= $${values.length}`);
            }
            if (params.maxPrice !== undefined) {
                values.push(params.maxPrice);
                conditions.push(`l.base_price <= $${values.length}`);
            }
            if (params.minRating !== undefined) {
                values.push(params.minRating);
                conditions.push(`l.average_rating >= $${values.length}`);
            }
            if (params.amenities && params.amenities.length > 0) {
                values.push(JSON.stringify(params.amenities));
                conditions.push(`l.attributes @> $${values.length}::jsonb`);
            }
            let orderBy = `"distanceMeters" ASC NULLS LAST`;
            switch (sortBy) {
                case search_dto_1.SortMode.RATING:
                    orderBy = `CASE WHEN l.average_rating > 0 THEN (l.average_rating * 100 + l.total_reviews) ELSE 0 END DESC, ${hasSpatial ? '"distanceMeters" ASC NULLS LAST,' : ''} l.id DESC`;
                    break;
                case search_dto_1.SortMode.PRICE_ASC:
                    orderBy = `l.base_price ASC NULLS LAST${hasSpatial ? ', "distanceMeters" ASC NULLS LAST' : ''}`;
                    break;
                case search_dto_1.SortMode.PRICE_DESC:
                    orderBy = `l.base_price DESC NULLS LAST${hasSpatial ? ', "distanceMeters" ASC NULLS LAST' : ''}`;
                    break;
                case search_dto_1.SortMode.RELEVANCE:
                    orderBy = `${hasKeyword ? '"textScore" DESC NULLS LAST,' : ''} CASE WHEN l.average_rating > 0 THEN (l.average_rating * 100 + l.total_reviews) ELSE 0 END DESC${hasSpatial ? ', "distanceMeters" ASC NULLS LAST' : ''}, l.id DESC`;
                    break;
                case search_dto_1.SortMode.DISTANCE:
                default:
                    orderBy = hasSpatial
                        ? `"distanceMeters" ASC NULLS LAST`
                        : `${hasKeyword ? '"textScore" DESC NULLS LAST,' : ''} CASE WHEN l.average_rating > 0 THEN (l.average_rating * 100 + l.total_reviews) ELSE 0 END DESC, l.id DESC`;
                    break;
            }
            values.push(limit, offset);
            const limitIdx = values.length - 1;
            const offsetIdx = values.length;
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const withClause = ctes.length > 0 ? `WITH ${ctes.join(', ')}` : '';
            const sql = `
        ${withClause}
        SELECT
          l.id,
          l.title,
          l.description,
          l.category,
          l.sub_category AS "subCategory",
          l.province,
          l.base_price AS "basePrice",
          l.price_unit AS "priceUnit",
          l.average_rating AS "averageRating",
          l.total_reviews AS "totalReviews",
          l.latitude,
          l.longitude,
          l.thumbnail_url AS "thumbnailUrl",
          l.complex_id AS "complexId",
          l.host_id AS "hostId",
          ${selectDistance},
          ${selectTextScore}
        FROM public.listings l
        ${joins.join('\n        ')}
        ${whereClause}
        ORDER BY ${orderBy}
        LIMIT $${limitIdx} OFFSET $${offsetIdx};
      `;
            const result = await this.pool.query(sql, values);
            return result.rows;
        }
        catch (error) {
            this.logger.error(`Error in search listings: ${error.message}`);
            throw error;
        }
    }
    async findNearby(params) {
        return this.search(params);
    }
    async findById(id) {
        const sql = `SELECT * FROM public.listings WHERE id = $1 AND status = 'ACTIVE' LIMIT 1`;
        const result = await this.pool.query(sql, [id]);
        return result.rows[0];
    }
};
exports.ListingRepository = ListingRepository;
exports.ListingRepository = ListingRepository = ListingRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(catalog_read_pool_1.CATALOG_POOL)),
    __metadata("design:paramtypes", [pg_1.Pool])
], ListingRepository);
//# sourceMappingURL=listing.repository.js.map