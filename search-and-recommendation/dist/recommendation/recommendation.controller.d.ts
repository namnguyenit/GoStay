import { RecommendationService } from './recommendation.service';
import { HomeFeedQueryDto, NearbyRecommendationQueryDto } from './recommendation.dto';
export declare class RecommendationController {
    private readonly recommendationService;
    constructor(recommendationService: RecommendationService);
    getHeroLandmarks(): Promise<any[]>;
    getHomeFeed(dto: HomeFeedQueryDto): Promise<any>;
    getProvinces(): Promise<any[]>;
    getProvinceDestinations(province: string): Promise<any[]>;
    getComplexes(limit?: string): Promise<any[]>;
    getComplexDetail(id: string): Promise<any>;
    getComplexRecommendations(id: string, limit?: string): Promise<any[]>;
    getHomeRecommendations(province?: string): Promise<any[]>;
    getNearbyRecommendations(dto: NearbyRecommendationQueryDto): Promise<any>;
    getByLandmark(landmarkId: string, radius?: string, radiusMeters?: string): Promise<any>;
    getSimilar(listingId: string, limit?: string): Promise<any[]>;
}
