"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiversityService = void 0;
const common_1 = require("@nestjs/common");
let DiversityService = class DiversityService {
    diversifyAndRank(scoredCandidates, topN = 20) {
        const sorted = [...scoredCandidates].sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
        const selected = [];
        const selectedIds = new Set();
        const hostCounts = new Map();
        const complexCounts = new Map();
        const maxPerHost = Math.min(2, topN);
        const maxPerComplex = Math.min(3, topN);
        for (const candidate of sorted) {
            if (selected.length >= topN)
                break;
            const hostId = candidate.hostId || candidate.host_id;
            const complexId = candidate.complexId || candidate.complex_id;
            const hostCount = hostId ? hostCounts.get(hostId) || 0 : 0;
            const complexCount = complexId ? complexCounts.get(complexId) || 0 : 0;
            if (hostId && hostCount >= maxPerHost)
                continue;
            if (complexId && complexCount >= maxPerComplex)
                continue;
            selected.push(candidate);
            selectedIds.add(candidate.id);
            if (hostId)
                hostCounts.set(hostId, hostCount + 1);
            if (complexId)
                complexCounts.set(complexId, complexCount + 1);
        }
        for (const candidate of sorted) {
            if (selected.length >= topN)
                break;
            if (selectedIds.has(candidate.id))
                continue;
            selected.push(candidate);
            selectedIds.add(candidate.id);
        }
        return selected;
    }
};
exports.DiversityService = DiversityService;
exports.DiversityService = DiversityService = __decorate([
    (0, common_1.Injectable)()
], DiversityService);
//# sourceMappingURL=diversity.service.js.map