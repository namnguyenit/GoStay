import { Pool } from 'pg';
export interface LandmarkCandidate {
    id: string;
    name: string;
    province: string;
    latitude: number;
    longitude: number;
    thumbnailUrl?: string;
    radiusMeters?: number;
    textScore?: number;
}
export declare class LandmarkRepository {
    private readonly pool;
    private readonly logger;
    constructor(pool: Pool);
    autocomplete(query: string, limit?: number): Promise<LandmarkCandidate[]>;
    findFeatured(limit?: number): Promise<LandmarkCandidate[]>;
    findByProvince(province: string, limit?: number): Promise<LandmarkCandidate[]>;
    findPopularProvinces(limit?: number): Promise<any[]>;
    findProvinceSuggestions(query: string, limit?: number): Promise<any[]>;
    findById(id: string): Promise<any>;
}
