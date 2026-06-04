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
    const cacheKey = `recommend:landmark:${landmarkId}`;
    const cached = await this.cacheService.get<any[]>(cacheKey);
    if (cached) return cached;

    const candidates =
      await this.candidateGenerator.generateByLandmark(landmarkId);
    const scored = this.scoringService.score(candidates, {});
    const finalRanked = this.diversityService.diversifyAndRank(scored, 15);
    await this.cacheService.set(cacheKey, finalRanked, 300);
    return finalRanked;
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
