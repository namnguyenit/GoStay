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
var ComplexRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplexRepository = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
const catalog_read_pool_1 = require("../../database/catalog-read.pool");
let ComplexRepository = ComplexRepository_1 = class ComplexRepository {
    pool;
    logger = new common_1.Logger(ComplexRepository_1.name);
    constructor(pool) {
        this.pool = pool;
    }
    async autocomplete(query, limit = 5) {
        try {
            const sql = `
        WITH q AS (
          SELECT public.gostay_normalize_search_text($1) AS normalized_query
        )
        SELECT
          c.id,
          c.name,
          c.province,
          c.latitude,
          c.longitude,
          c.thumbnail_url AS "thumbnailUrl",
          similarity(public.gostay_normalize_search_text(c.name), q.normalized_query) AS "textScore"
        FROM public.complexes c
        CROSS JOIN q
        WHERE c.status = 'ACTIVE'
          AND (
            public.gostay_normalize_search_text(c.name) % q.normalized_query
            OR public.gostay_normalize_search_text(c.name) LIKE '%' || q.normalized_query || '%'
          )
        ORDER BY
          CASE WHEN public.gostay_normalize_search_text(c.name) LIKE q.normalized_query || '%' THEN 0 ELSE 1 END,
          "textScore" DESC,
          c.name ASC
        LIMIT $2;
      `;
            const result = await this.pool.query(sql, [query, limit]);
            return result.rows;
        }
        catch (error) {
            this.logger.error(`Error in autocomplete complex: ${error.message}`);
            throw error;
        }
    }
    async findById(id) {
        try {
            const sql = `SELECT * FROM public.complexes WHERE id = $1 AND status = 'ACTIVE' LIMIT 1`;
            const result = await this.pool.query(sql, [id]);
            return result.rows[0];
        }
        catch (error) {
            this.logger.error(`Error finding complex by id: ${error.message}`);
            throw error;
        }
    }
    async findByProvince(province, limit = 12) {
        try {
            const sql = `
        SELECT
          c.id,
          c.name,
          c.province,
          c.latitude,
          c.longitude,
          c.thumbnail_url AS "thumbnailUrl",
          c.created_at AS "createdAt",
          c.updated_at AS "updatedAt"
        FROM public.complexes c
        WHERE c.status = 'ACTIVE'
          AND c.province = $1
        ORDER BY
          c.updated_at DESC NULLS LAST,
          c.created_at DESC NULLS LAST,
          c.name ASC
        LIMIT $2;
      `;
            const result = await this.pool.query(sql, [province, limit]);
            return result.rows;
        }
        catch (error) {
            this.logger.error(`Error finding complexes by province: ${error.message}`);
            throw error;
        }
    }
    async findAll(limit = 120) {
        try {
            const sql = `
        SELECT
          c.id,
          c.name,
          c.description,
          c.province,
          c.latitude,
          c.longitude,
          c.thumbnail_url AS "thumbnailUrl",
          c.gallery_urls AS "galleryUrls",
          c.created_at AS "createdAt",
          c.updated_at AS "updatedAt",
          COUNT(l.id)::int AS "listingCount"
        FROM public.complexes c
        LEFT JOIN public.listings l
          ON l.complex_id = c.id
          AND l.status = 'ACTIVE'
        WHERE c.status = 'ACTIVE'
        GROUP BY c.id
        ORDER BY
          "listingCount" DESC,
          c.updated_at DESC NULLS LAST,
          c.created_at DESC NULLS LAST,
          c.name ASC
        LIMIT $1;
      `;
            const result = await this.pool.query(sql, [limit]);
            return result.rows;
        }
        catch (error) {
            this.logger.error(`Error finding complexes: ${error.message}`);
            throw error;
        }
    }
    async findNearby(lat, lng, radiusMeters = 5000, limit = 12) {
        try {
            const sql = `
        WITH geo AS (
          SELECT ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography AS point
        )
        SELECT
          c.id,
          c.name,
          c.description,
          c.province,
          c.latitude,
          c.longitude,
          c.thumbnail_url AS "thumbnailUrl",
          c.gallery_urls AS "galleryUrls",
          ST_Distance(c.location::geography, geo.point) AS "distanceMeters",
          COUNT(l.id)::int AS "listingCount"
        FROM public.complexes c
        CROSS JOIN geo
        LEFT JOIN public.listings l
          ON l.complex_id = c.id
          AND l.status = 'ACTIVE'
        WHERE c.status = 'ACTIVE'
          AND c.location IS NOT NULL
          AND ST_DWithin(c.location::geography, geo.point, $3)
        GROUP BY c.id, geo.point
        ORDER BY
          "distanceMeters" ASC,
          "listingCount" DESC,
          c.name ASC
        LIMIT $4;
      `;
            const result = await this.pool.query(sql, [
                lng,
                lat,
                radiusMeters,
                limit,
            ]);
            return result.rows;
        }
        catch (error) {
            this.logger.error(`Error finding nearby complexes: ${error.message}`);
            throw error;
        }
    }
    async findProvinceCounts(limit = 50) {
        try {
            const sql = `
        SELECT
          c.province AS name,
          COUNT(*)::int AS "complexCount"
        FROM public.complexes c
        WHERE c.status = 'ACTIVE'
          AND c.province IS NOT NULL
        GROUP BY c.province
        ORDER BY
          "complexCount" DESC,
          c.province ASC
        LIMIT $1;
      `;
            const result = await this.pool.query(sql, [limit]);
            return result.rows;
        }
        catch (error) {
            this.logger.error(`Error finding complex province counts: ${error.message}`);
            throw error;
        }
    }
};
exports.ComplexRepository = ComplexRepository;
exports.ComplexRepository = ComplexRepository = ComplexRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(catalog_read_pool_1.CATALOG_POOL)),
    __metadata("design:paramtypes", [pg_1.Pool])
], ComplexRepository);
//# sourceMappingURL=complex.repository.js.map