import { Injectable } from '@nestjs/common';

@Injectable()
export class DiversityService {
  /**
   * Sắp xếp và đảm bảo tính đa dạng (không để 1 host hoặc 1 group chiếm quá nhiều top kết quả)
   */
  diversifyAndRank(scoredCandidates: any[], topN: number = 20) {
    const sorted = [...scoredCandidates].sort(
      (a, b) => (b.finalScore || 0) - (a.finalScore || 0),
    );
    const selected: any[] = [];
    const selectedIds = new Set<string>();
    const hostCounts = new Map<string, number>();
    const complexCounts = new Map<string, number>();
    const maxPerHost = Math.min(2, topN);
    const maxPerComplex = Math.min(3, topN);

    for (const candidate of sorted) {
      if (selected.length >= topN) break;

      const hostId = candidate.hostId || candidate.host_id;
      const complexId = candidate.complexId || candidate.complex_id;
      const hostCount = hostId ? hostCounts.get(hostId) || 0 : 0;
      const complexCount = complexId ? complexCounts.get(complexId) || 0 : 0;

      if (hostId && hostCount >= maxPerHost) continue;
      if (complexId && complexCount >= maxPerComplex) continue;

      selected.push(candidate);
      selectedIds.add(candidate.id);
      if (hostId) hostCounts.set(hostId, hostCount + 1);
      if (complexId) complexCounts.set(complexId, complexCount + 1);
    }

    for (const candidate of sorted) {
      if (selected.length >= topN) break;
      if (selectedIds.has(candidate.id)) continue;
      selected.push(candidate);
      selectedIds.add(candidate.id);
    }

    return selected;
  }
}
