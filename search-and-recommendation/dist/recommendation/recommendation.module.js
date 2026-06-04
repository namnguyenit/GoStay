"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationModule = void 0;
const common_1 = require("@nestjs/common");
const search_module_1 = require("../search/search.module");
const candidate_generator_1 = require("./candidate-generator");
const cross_sell_controller_1 = require("./cross-sell.controller");
const cross_sell_service_1 = require("./cross-sell.service");
const diversity_service_1 = require("./diversity.service");
const recommendation_controller_1 = require("./recommendation.controller");
const recommendation_service_1 = require("./recommendation.service");
const scoring_service_1 = require("./scoring.service");
let RecommendationModule = class RecommendationModule {
};
exports.RecommendationModule = RecommendationModule;
exports.RecommendationModule = RecommendationModule = __decorate([
    (0, common_1.Module)({
        imports: [search_module_1.SearchModule],
        controllers: [recommendation_controller_1.RecommendationController, cross_sell_controller_1.CrossSellController],
        providers: [
            candidate_generator_1.CandidateGenerator,
            scoring_service_1.ScoringService,
            diversity_service_1.DiversityService,
            recommendation_service_1.RecommendationService,
            cross_sell_service_1.CrossSellService,
        ],
    })
], RecommendationModule);
//# sourceMappingURL=recommendation.module.js.map