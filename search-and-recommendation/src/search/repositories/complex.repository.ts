import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { CATALOG_POOL } from '../../database/catalog-read.pool';

@Injectable()
export class ComplexRepository {
  private readonly logger = new Logger(ComplexRepository.name);

  constructor(@Inject(CATALOG_POOL) private readonly pool: Pool) {}

  async autocomplete(query: string, limit: number = 5): Promise<any[]> {
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
    } catch (error) {
      this.logger.error(`Error in autocomplete complex: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string): Promise<any> {
    try {
      const sql = `SELECT * FROM public.complexes WHERE id = $1 AND status = 'ACTIVE' LIMIT 1`;
      const result = await this.pool.query(sql, [id]);
      return result.rows[0];
    } catch (error) {
      this.logger.error(`Error finding complex by id: ${error.message}`);
      throw error;
    }
  }

  async findByProvince(province: string, limit: number = 12): Promise<any[]> {
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
    } catch (error) {
      this.logger.error(
        `Error finding complexes by province: ${error.message}`,
      );
      throw error;
    }
  }

  async findAll(limit: number = 120): Promise<any[]> {
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
    } catch (error) {
      this.logger.error(`Error finding complexes: ${error.message}`);
      throw error;
    }
  }

  async findNearby(
    lat: number,
    lng: number,
    radiusMeters: number = 5000,
    limit: number = 12,
  ): Promise<any[]> {
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
    } catch (error) {
      this.logger.error(`Error finding nearby complexes: ${error.message}`);
      throw error;
    }
  }

  async findProvinceCounts(limit: number = 50): Promise<any[]> {
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
    } catch (error) {
      this.logger.error(
        `Error finding complex province counts: ${error.message}`,
      );
      throw error;
    }
  }

}
