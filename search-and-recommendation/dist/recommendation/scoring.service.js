"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoringService = void 0;
const common_1 = require("@nestjs/common");
let ScoringService = class ScoringService {
    score(candidates, context) {
        return candidates.map(candidate => {
            let finalScore = 0;
            let geoScore = 0;
            if (candidate.distanceMeters !== undefined && candidate.distanceMeters !== null) {
                const maxDist = 10000;
                const dist = Math.min(candidate.distanceMeters, maxDist);
                geoScore = ((maxDist - dist) / maxDist) * 100;
                finalScore += 0.30 * geoScore;
            }
            let categoryScore = 0;
            if (context.targetCategory && candidate.category === context.targetCategory) {
                categoryScore = 100;
                finalScore += 0.20 * categoryScore;
            }
            let ratingScore = 0;
            if (candidate.averageRating) {
                const penalty = (candidate.totalReviews || 0) < 5 ? 0.8 : 1.0;
                ratingScore = (candidate.averageRating / 5) * 100 * penalty;
                finalScore += 0.15 * ratingScore;
            }
            let popularityScore = 0;
            const reviews = candidate.totalReviews || 0;
            popularityScore = Math.min(reviews, 100);
            finalScore += 0.10 * popularityScore;
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
};
exports.ScoringService = ScoringService;
exports.ScoringService = ScoringService = __decorate([
    (0, common_1.Injectable)()
], ScoringService);
//# sourceMappingURL=scoring.service.js.map