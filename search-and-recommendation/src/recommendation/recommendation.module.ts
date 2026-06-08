import { Module } from '@nestjs/common';
import { SearchModule } from '../search/search.module';
import { CandidateGenerator } from './candidate-generator';
import { CrossSellController } from './cross-sell.controller';
import { CrossSellService } from './cross-sell.service';
import { DiversityService } from './diversity.service';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { ScoringService } from './scoring.service';

@Module({
  imports: [SearchModule], // To inject repositories
  controllers: [RecommendationController, CrossSellController],
  providers: [
    CandidateGenerator,
    ScoringService,
    DiversityService,
    RecommendationService,
    CrossSellService,
  ],
})
export class RecommendationModule {}
