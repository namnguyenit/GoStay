export interface ScoringContext {
    targetCategory?: string;
    targetLat?: number;
    targetLng?: number;
    complexId?: string;
}
export declare class ScoringService {
    score(candidates: any[], context: ScoringContext): any[];
}
