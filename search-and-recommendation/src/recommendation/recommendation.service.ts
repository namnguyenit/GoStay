import { Injectable, Logger } from '@nestjs/common';
import { RedisCacheService } from '../cache/redis-cache.service';
import { CandidateGenerator } from './candidate-generator';
import { DiversityService } from './diversity.service';
import { ScoringService } from './scoring.service';
import { HomeFeedQueryDto } from './recommendation.dto';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    private readonly candidateGenerator: CandidateGenerator,
    private readonly scoringService: ScoringService,
    private readonly diversityService: DiversityService,
    private readonly cacheService: RedisCacheService,
  ) {}

  async getHeroLandmarks() {
    const cacheKey = 'home:hero-landmarks:v1';
    const cached = await this.cacheService.get<any[]>(cacheKey);
    if (cached) return cached;

    const data = await this.candidateGenerator.getHeroLandmarks(6);
    await this.cacheService.set(cacheKey, data, 3600);
    return data;
  }

  async getHomeFeed(dto: HomeFeedQueryDto) {
    const latValue = dto.lat === undefined ? undefined : Number(dto.lat);
    const lngValue = dto.lng === undefined ? undefined : Number(dto.lng);
    const hasCoordinates =
      Number.isFinite(latValue) && Number.isFinite(lngValue);
    const lat = hasCoordinates ? latValue!.toFixed(2) : 'none';
    const lng = hasCoordinates ? lngValue!.toFixed(2) : 'none';
    const cat = dto.category || 'ALL';
    const cursor = dto.cursor || '0';
    const cacheKey = `home:feed:${lat}:${lng}:${cat}:${cursor}`;

    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) return cached;

    let candidates;
    let featuredLandmarks: any[] = [];
    if (hasCoordinates) {
      candidates = await this.candidateGenerator.generateByCoordinate(
        latValue!,
        lngValue!,
        20000,
        50,
        dto.category,
      );
    } else {
      if (cat === 'ALL') {
        featuredLandmarks = await this.candidateGenerator.getHeroLandmarks(6);
      }
      candidates = await this.candidateGenerator.generateForHome(
        undefined,
        50,
        dto.category,
      );
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

  async getProvinceDestinations(province: string) {
    const cacheKey = `province:destinations:${province}`;
    const cached = await this.cacheService.get<any[]>(cacheKey);
    if (cached) return cached;

    const data = await this.candidateGenerator.generateProvinceDestinations(
      province,
      24,
    );
    await this.cacheService.set(cacheKey, data, 3600);
    return data;
  }

  async getComplexes(limit: number = 120) {
    const safeLimit = Number.isFinite(limit)
      ? Math.max(1, Math.min(Math.floor(limit), 200))
      : 120;
    const cacheKey = `recommend:complexes:limit:${safeLimit}`;
    const cached = await this.cacheService.get<any[]>(cacheKey);
    if (cached) return cached;

    const data = await this.candidateGenerator.generateComplexes(safeLimit);
    await this.cacheService.set(cacheKey, data, 300);
    return data;
  }

  async recommendByComplex(complexId: string) {
    const cacheKey = `recommend:complex:${complexId}`;
    const cached = await this.cacheService.get<any[]>(cacheKey);
    if (cached) return cached;

    const candidates =
      await this.candidateGenerator.generateByComplex(complexId);
    const scored = this.scoringService.score(candidates, { complexId });
    const finalRanked = this.diversityService.diversifyAndRank(scored, 15);

    await this.cacheService.set(cacheKey, finalRanked, 300);
    return finalRanked;
  }

  // Backwards compatibility for the old methods
  async recommendNearby(
    lat: number | string,
    lng: number | string,
    category?: any,
  ) {
    return this.getHomeFeed({ lat: Number(lat), lng: Number(lng), category });
  }

  async recommendForHome(province?: string) {
    return this.candidateGenerator.generateForHome(province, 20);
  }

  async recommendByLandmark(landmarkId: string) {
    return this.recommendByLandmarkGrouped(landmarkId, 5000);
  }

  async recommendByLandmarkGrouped(
    landmarkId: string,
    radiusMeters: number = 5000,
  ) {
    const safeRadiusMeters =
      Number.isFinite(radiusMeters) && radiusMeters > 0 ? radiusMeters : 5000;
    const cacheKey = `recommend:landmark:${landmarkId}:radius:${safeRadiusMeters}`;
    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const [candidates, complexes] = await Promise.all([
      this.candidateGenerator.generateByLandmark(
        landmarkId,
        200,
        safeRadiusMeters,
      ),
      this.candidateGenerator.generateComplexesByLandmark(
        landmarkId,
        safeRadiusMeters,
        12,
      ),
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

  async recommendSimilar(listingId: string) {
    const cacheKey = `recommend:similar:${listingId}`;
    const cached = await this.cacheService.get<any[]>(cacheKey);
    if (cached) return cached;

    const candidates = await this.candidateGenerator.generateSimilar(listingId);
    const scored = this.scoringService.score(candidates, {});
    const finalRanked = this.diversityService.diversifyAndRank(scored, 10);
    await this.cacheService.set(cacheKey, finalRanked, 300);
    return finalRanked;
  }
}
