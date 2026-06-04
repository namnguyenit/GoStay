import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { RedisCacheService } from '../cache/redis-cache.service';
import { InventoryClient } from '../inventory/inventory.client';
import { CandidateGenerator } from './candidate-generator';
import { CrossSellRequestDto } from './recommendation.dto';
import { DiversityService } from './diversity.service';
import { ScoringService } from './scoring.service';

@Injectable()
export class CrossSellService {
  private readonly logger = new Logger(CrossSellService.name);

  constructor(
    private readonly candidateGenerator: CandidateGenerator,
    private readonly scoringService: ScoringService,
    private readonly diversityService: DiversityService,
    private readonly cacheService: RedisCacheService,
    private readonly inventoryClient: InventoryClient,
  ) {}

  async recommendForCartItem(dto: CrossSellRequestDto) {
    const hash = createHash('md5').update(JSON.stringify(dto)).digest('hex');
    const cacheKey = `cross-sell:${hash}`;

    const cached = await this.cacheService.get<any[]>(cacheKey);
    if (cached) return cached;

    const candidates = await this.candidateGenerator.generateCrossSell(
      dto.sourceListingId,
      dto.cartListingIds,
      50,
    );
    const scored = this.scoringService.score(candidates, {});
    let finalRanked = this.diversityService.diversifyAndRank(
      scored,
      dto.limit || 5,
    );

    try {
      const listingIds = finalRanked.map((candidate) => candidate.id);
      if (listingIds.length > 0) {
        const inventoryRes = await this.inventoryClient.checkBatchAvailability({
          listingIds,
          startDate: dto.checkIn,
          endDate: dto.checkOut,
          requiredQuantity: dto.guests || 1,
        });
        const availableSet = new Set(inventoryRes.availableListingIds || []);
        finalRanked = finalRanked.filter((candidate) =>
          availableSet.has(candidate.id),
        );
      }
    } catch (error) {
      this.logger.error(
        'Cross-sell inventory check failed, returning no cross-sell items',
        error,
      );
      finalRanked = [];
    }

    await this.cacheService.set(cacheKey, finalRanked, 60);
    return finalRanked;
  }
}
