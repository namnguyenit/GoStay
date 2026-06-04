import { RedisCacheService } from '../cache/redis-cache.service';
import { InventoryClient } from '../inventory/inventory.client';
import { CandidateGenerator } from './candidate-generator';
import { CrossSellRequestDto } from './recommendation.dto';
import { DiversityService } from './diversity.service';
import { ScoringService } from './scoring.service';
export declare class CrossSellService {
    private readonly candidateGenerator;
    private readonly scoringService;
    private readonly diversityService;
    private readonly cacheService;
    private readonly inventoryClient;
    private readonly logger;
    constructor(candidateGenerator: CandidateGenerator, scoringService: ScoringService, diversityService: DiversityService, cacheService: RedisCacheService, inventoryClient: InventoryClient);
    recommendForCartItem(dto: CrossSellRequestDto): Promise<any[]>;
}
