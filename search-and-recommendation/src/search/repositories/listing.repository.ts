import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { CATALOG_POOL } from '../../database/catalog-read.pool';
import { SortMode } from '../search.dto';

export interface ListingSearchParams {
  lat?: number;
  lng?: number;
  radiusMeters?: number;
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
  q?: string;
  province?: string;
  complexId?: string;
  category?: string; // ALL, STAY, EXP, SVC
  limit: number;
  offset: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  amenities?: string[];
  sortBy?: SortMode;
}

@Injectable()
export class ListingRepository {
  private readonly logger = new Logger(ListingRepository.name);

  constructor(@Inject(CATALOG_POOL) private readonly pool: Pool) {}

  async search(params: ListingSearchParams): Promise<any[]> {
    const {
      lat,
      lng,
      radiusMeters = 5000,
      category = 'ALL',
      limit = 20,
      offset = 0,
      sortBy = SortMode.DISTANCE,
    } = params;
    const keyword = params.q?.trim();
    const hasSpatial = lat !== undefined && lng !== undefined;
    const hasBbox =
      params.minLat !== undefined &&
      params.maxLat !== undefined &&
      params.minLng !== undefined &&
      params.maxLng !== undefined;
    const hasKeyword = Boolean(keyword);

    try {
      const values: any[] = [];
      const conditions: string[] = ["l.status = 'ACTIVE'"];
      const ctes: string[] = [];
      const joins: string[] = [];

      let selectDistance = 'NULL AS "distanceMeters"';
      let selectTextScore = 'NULL::double precision AS "textScore"';

      // Spatial conditions
      if (hasSpatial) {
        values.push(lng, lat, radiusMeters); // $1, $2, $3
        ctes.push(
          `geo AS (SELECT ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography AS point)`,
        );
        joins.push('CROSS JOIN geo');
        conditions.push(`l.location IS NOT NULL`);
        conditions.push(`ST_DWithin(l.location::geography, geo.point, $3)`);
        selectDistance = `ST_Distance(l.location::geography, geo.point) AS "distanceMeters"`;
      }

      if (hasKeyword) {
        values.push(keyword);
        ctes.push(
          `search_q AS (SELECT public.gostay_normalize_search_text($${values.length}) AS normalized_query)`,
        );
        joins.push('CROSS JOIN search_q');
        conditions.push(`l.title_normalized IS NOT NULL`);
        conditions.push(`(
          l.title_normalized % search_q.normalized_query
          OR l.title_normalized LIKE '%' || search_q.normalized_query || '%'
        )`);
        selectTextScore = `similarity(l.title_normalized, search_q.normalized_query) AS "textScore"`;
      }

      if (hasBbox) {
        const south = Math.min(params.minLat!, params.maxLat!);
        const north = Math.max(params.minLat!, params.maxLat!);
        const west = Math.min(params.minLng!, params.maxLng!);
        const east = Math.max(params.minLng!, params.maxLng!);
        values.push(south, north, west, east);
        conditions.push(
          `l.latitude BETWEEN $${values.length - 3} AND $${values.length - 2}`,
        );
        conditions.push(
          `l.longitude BETWEEN $${values.length - 1} AND $${values.length}`,
        );
        conditions.push(`l.location IS NOT NULL`);
      }

      // Category filter
      if (category !== 'ALL') {
        values.push(category);
        conditions.push(`l.category = $${values.length}`);
      }

      if (params.province) {
        values.push(params.province);
        conditions.push(`l.province = $${values.length}`);
      }

      if (params.complexId) {
        values.push(params.complexId);
        conditions.push(`l.complex_id = $${values.length}::uuid`);
      }

      // Price filters
      if (params.minPrice !== undefined) {
        values.push(params.minPrice);
        conditions.push(`l.base_price >= $${values.length}`);
      }
      if (params.maxPrice !== undefined) {
        values.push(params.maxPrice);
        conditions.push(`l.base_price <= $${values.length}`);
      }

      // Rating filter
      if (params.minRating !== undefined) {
        values.push(params.minRating);
        conditions.push(`l.average_rating >= $${values.length}`);
      }

      // Amenities filter (JSONB contains query)
      if (params.amenities && params.amenities.length > 0) {
        values.push(JSON.stringify(params.amenities));
        conditions.push(`l.attributes @> $${values.length}::jsonb`);
      }

      // Sorting
      let orderBy = `"distanceMeters" ASC NULLS LAST`;
      switch (sortBy) {
        case SortMode.RATING:
          orderBy = `l.average_rating DESC NULLS LAST, ${hasSpatial ? '"distanceMeters" ASC NULLS LAST,' : ''} l.total_reviews DESC NULLS LAST`;
          break;
        case SortMode.PRICE_ASC:
          orderBy = `l.base_price ASC NULLS LAST${hasSpatial ? ', "distanceMeters" ASC NULLS LAST' : ''}`;
          break;
        case SortMode.PRICE_DESC:
          orderBy = `l.base_price DESC NULLS LAST${hasSpatial ? ', "distanceMeters" ASC NULLS LAST' : ''}`;
          break;
        case SortMode.RELEVANCE:
          // A mix of rating, popularity and distance.
          orderBy = `${hasKeyword ? '"textScore" DESC NULLS LAST,' : ''} l.total_reviews DESC NULLS LAST, l.average_rating DESC NULLS LAST${hasSpatial ? ', "distanceMeters" ASC NULLS LAST' : ''}`;
          break;
        case SortMode.DISTANCE:
        default:
          orderBy = hasSpatial
            ? `"distanceMeters" ASC NULLS LAST`
            : `${hasKeyword ? '"textScore" DESC NULLS LAST,' : ''} l.total_reviews DESC NULLS LAST, l.average_rating DESC NULLS LAST`;
          break;
      }

      values.push(limit, offset);
      const limitIdx = values.length - 1;
      const offsetIdx = values.length;

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const withClause = ctes.length > 0 ? `WITH ${ctes.join(', ')}` : '';

      const sql = `
        ${withClause}
        SELECT
          l.id,
          l.title,
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
          l.complex_id,
          l.host_id,
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
    } catch (error) {
      this.logger.error(`Error in search listings: ${error.message}`);
      throw error;
    }
  }

  // Backwards compatibility for CandidateGenerator
  async findNearby(params: any): Promise<any[]> {
    return this.search(params);
  }

  async findById(id: string): Promise<any> {
    const sql = `SELECT * FROM public.listings WHERE id = $1 AND status = 'ACTIVE' LIMIT 1`;
    const result = await this.pool.query(sql, [id]);
    return result.rows[0];
  }
}
