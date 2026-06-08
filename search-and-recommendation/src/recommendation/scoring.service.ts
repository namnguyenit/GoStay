import { Injectable } from '@nestjs/common';

export interface ScoringContext {
  targetCategory?: string;
  targetLat?: number;
  targetLng?: number;
  complexId?: string;
}

@Injectable()
export class ScoringService {
  /**
   * Chấm điểm candidate dựa trên rule-based formula v1
   */
  score(candidates: any[], context: ScoringContext) {
    return candidates.map(candidate => {
      let finalScore = 0;

      // 1. Geo score (30%) - càng gần càng điểm cao
      let geoScore = 0;
      if (candidate.distanceMeters !== undefined && candidate.distanceMeters !== null) {
        // Assume 10km is max context distance. Closer -> higher score.
        const maxDist = 10000; 
        const dist = Math.min(candidate.distanceMeters, maxDist);
        geoScore = ((maxDist - dist) / maxDist) * 100;
        finalScore += 0.30 * geoScore;
      }

      // 2. Category score (20%)
      let categoryScore = 0;
      if (context.targetCategory && candidate.category === context.targetCategory) {
        categoryScore = 100;
        finalScore += 0.20 * categoryScore;
      }

      // 3. Rating score (15%)
      let ratingScore = 0;
      if (candidate.averageRating) {
        // Phạt nhẹ nếu ít review
        const penalty = (candidate.totalReviews || 0) < 5 ? 0.8 : 1.0;
        ratingScore = (candidate.averageRating / 5) * 100 * penalty;
        finalScore += 0.15 * ratingScore;
      }

      // 4. Popularity score (10%)
      let popularityScore = 0;
      const reviews = candidate.totalReviews || 0;
      popularityScore = Math.min(reviews, 100); // capped at 100
      finalScore += 0.10 * popularityScore;

      // 5. Complex boost (5%)
      let complexBoost = 0;
      const candidateComplexId = candidate.complexId || candidate.complex_id;
      if (context.complexId && candidateComplexId === context.complexId) {
        complexBoost = 100;
        finalScore += 0.05 * complexBoost;
      }

      return {
        ...candidate,
        scoreDetails: {
          geoScore,
          categoryScore,
          ratingScore,
          popularityScore,
          complexBoost,
        },
        finalScore,
      };
    });
  }
}
