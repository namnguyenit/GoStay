import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { CATALOG_POOL } from '../../database/catalog-read.pool';

export interface LandmarkCandidate {
  id: string;
  name: string;
  province: string;
  latitude: number;
  longitude: number;
  thumbnailUrl?: string;
  radiusMeters?: number;
  textScore?: number;
}

@Injectable()
export class LandmarkRepository {
  private readonly logger = new Logger(LandmarkRepository.name);

  constructor(@Inject(CATALOG_POOL) private readonly pool: Pool) {}

  /**
   * Autocomplete landmark bằng trigram similarity.
   * Yêu cầu schema public, bảng landmarks, hàm gostay_normalize_search_text.
   */
  async autocomplete(
    query: string,
    limit: number = 5,
  ): Promise<LandmarkCandidate[]> {
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
    } catch (error) {
      this.logger.error(`Error in autocomplete landmark: ${error.message}`);
      throw error;
    }
  }

  async findFeatured(limit: number = 6): Promise<LandmarkCandidate[]> {
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
    } catch (error) {
      this.logger.error(`Error finding featured landmarks: ${error.message}`);
      throw error;
    }
  }

  async findByProvince(
    province: string,
    limit: number = 12,
  ): Promise<LandmarkCandidate[]> {
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
    } catch (error) {
      this.logger.error(
        `Error finding landmarks by province: ${error.message}`,
      );
      throw error;
    }
  }

  async findPopularProvinces(limit: number = 20): Promise<any[]> {
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
    } catch (error) {
      this.logger.error(`Error finding popular provinces: ${error.message}`);
      throw error;
    }
  }

  async findProvinceSuggestions(
    query: string,
    limit: number = 5,
  ): Promise<any[]> {
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
    } catch (error) {
      this.logger.error(`Error finding province suggestions: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string): Promise<any> {
    const sql = `SELECT * FROM public.landmarks WHERE id = $1 AND status = 'ACTIVE' LIMIT 1`;
    const result = await this.pool.query(sql, [id]);
    return result.rows[0];
  }
}
