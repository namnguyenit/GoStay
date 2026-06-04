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
var LandmarkRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LandmarkRepository = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
const catalog_read_pool_1 = require("../../database/catalog-read.pool");
let LandmarkRepository = LandmarkRepository_1 = class LandmarkRepository {
    pool;
    logger = new common_1.Logger(LandmarkRepository_1.name);
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
          lm.id,
          lm.name,
          lm.province,
          lm.latitude,
          lm.longitude,
          lm.radius_meters AS "radiusMeters",
          lm.thumbnail_url AS "thumbnailUrl",
          similarity(lm.name_normalized, q.normalized_query) AS "textScore"
        FROM public.landmarks lm
        CROSS JOIN q
        WHERE lm.status = 'ACTIVE'
          AND lm.name_normalized % q.normalized_query
        ORDER BY
          CASE WHEN lm.name_normalized LIKE q.normalized_query || '%' THEN 0 ELSE 1 END,
          "textScore" DESC,
          lm.is_featured DESC NULLS LAST
        LIMIT $2;
      `;
            const result = await this.pool.query(sql, [query, limit]);
            return result.rows;
        }
        catch (error) {
            this.logger.error(`Error in autocomplete landmark: ${error.message}`);
            throw error;
        }
    }
    async findFeatured(limit = 6) {
        try {
            const sql = `
        SELECT
          lm.id,
          lm.name,
          lm.province,
          lm.latitude,
          lm.longitude,
          lm.thumbnail_url AS "thumbnailUrl"
        FROM public.landmarks lm
        WHERE lm.status = 'ACTIVE'
        ORDER BY
          COALESCE(lm.is_featured, false) DESC,
          lm.updated_at DESC NULLS LAST,
          lm.created_at DESC NULLS LAST,
          lm.name ASC
        LIMIT $1;
      `;
            const result = await this.pool.query(sql, [limit]);
            return result.rows;
        }
        catch (error) {
            this.logger.error(`Error finding featured landmarks: ${error.message}`);
            throw error;
        }
    }
    async findByProvince(province, limit = 12) {
        try {
            const sql = `
        SELECT
          lm.id,
          lm.name,
          lm.province,
          lm.latitude,
          lm.longitude,
          lm.radius_meters AS "radiusMeters",
          lm.thumbnail_url AS "thumbnailUrl"
        FROM public.landmarks lm
        WHERE lm.status = 'ACTIVE'
          AND lm.province = $1
        ORDER BY
          COALESCE(lm.is_featured, false) DESC,
          lm.updated_at DESC NULLS LAST,
          lm.created_at DESC NULLS LAST,
          lm.name ASC
        LIMIT $2;
      `;
            const result = await this.pool.query(sql, [province, limit]);
            return result.rows;
        }
        catch (error) {
            this.logger.error(`Error finding landmarks by province: ${error.message}`);
            throw error;
        }
    }
    async findPopularProvinces(limit = 20) {
        try {
            const sql = `
        SELECT
          lm.province AS name,
          COUNT(*)::int AS "landmarkCount",
          COUNT(*) FILTER (WHERE COALESCE(lm.is_featured, false))::int AS "featuredLandmarkCount"
        FROM public.landmarks lm
        WHERE lm.status = 'ACTIVE'
          AND lm.province IS NOT NULL
        GROUP BY lm.province
        ORDER BY
          "featuredLandmarkCount" DESC,
          "landmarkCount" DESC,
          lm.province ASC
        LIMIT $1;
      `;
            const result = await this.pool.query(sql, [limit]);
            return result.rows.map((row, index) => ({
                id: row.name,
                name: row.name,
                code: row.name,
                landmarkCount: Number(row.landmarkCount || 0),
                featuredLandmarkCount: Number(row.featuredLandmarkCount || 0),
                rank: index + 1,
            }));
        }
        catch (error) {
            this.logger.error(`Error finding popular provinces: ${error.message}`);
            throw error;
        }
    }
    async findProvinceSuggestions(query, limit = 5) {
        try {
            const sql = `
        WITH q AS (
          SELECT public.gostay_normalize_search_text($1) AS normalized_query
        ),
        provinces AS (
          SELECT DISTINCT lm.province
          FROM public.landmarks lm
          WHERE lm.status = 'ACTIVE'
            AND lm.province IS NOT NULL
        )
        SELECT
          p.province AS name,
          similarity(public.gostay_normalize_search_text(p.province), q.normalized_query) AS "textScore"
        FROM provinces p
        CROSS JOIN q
        WHERE public.gostay_normalize_search_text(p.province) % q.normalized_query
          OR public.gostay_normalize_search_text(p.province) LIKE '%' || q.normalized_query || '%'
        ORDER BY
          CASE WHEN public.gostay_normalize_search_text(p.province) = q.normalized_query THEN 0 ELSE 1 END,
          "textScore" DESC,
          p.province ASC
        LIMIT $2;
      `;
            const result = await this.pool.query(sql, [query, limit]);
            return result.rows;
        }
        catch (error) {
            this.logger.error(`Error finding province suggestions: ${error.message}`);
            throw error;
        }
    }
    async findById(id) {
        const sql = `SELECT * FROM public.landmarks WHERE id = $1 AND status = 'ACTIVE' LIMIT 1`;
        const result = await this.pool.query(sql, [id]);
        return result.rows[0];
    }
};
exports.LandmarkRepository = LandmarkRepository;
exports.LandmarkRepository = LandmarkRepository = LandmarkRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(catalog_read_pool_1.CATALOG_POOL)),
    __metadata("design:paramtypes", [pg_1.Pool])
], LandmarkRepository);
//# sourceMappingURL=landmark.repository.js.map