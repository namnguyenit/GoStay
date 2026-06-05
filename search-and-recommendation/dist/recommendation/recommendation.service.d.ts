import { RedisCacheService } from '../cache/redis-cache.service';
import { CandidateGenerator } from './candidate-generator';
import { DiversityService } from './diversity.service';
import { ScoringService } from './scoring.service';
import { HomeFeedQueryDto } from './recommendation.dto';
export declare class RecommendationService {
    private readonly candidateGenerator;
    private readonly scoringService;
    private readonly diversityService;
    private readonly cacheService;
    private readonly logger;
    constructor(candidateGenerator: CandidateGenerator, scoringService: ScoringService, diversityService: DiversityService, cacheService: RedisCacheService);
    getHeroLandmarks(): Promise<any[]>;
    getHomeFeed(dto: HomeFeedQueryDto): Promise<any>;
    getProvinces(): Promise<any[]>;
    getProvinceDestinations(province: string): Promise<any[]>;
    recommendByComplex(complexId: string): Promise<any[]>;
    recommendNearby(lat: number | string, lng: number | string, category?: any): Promise<any>;
    recommendForHome(province?: string): Promise<any[]>;
    recommendByLandmark(landmarkId: string): Promise<any>;
    recommendByLandmarkGrouped(landmarkId: string, radiusMeters?: number): Promise<any>;
    recommendSimilar(listingId: string): Promise<any[]>;
}
