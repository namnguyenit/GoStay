import { Pool } from 'pg';
import { SortMode } from '../search.dto';
export interface ListingSearchParams {
    lat?: number;
    lng?: number;
    radiusMeters?: number;
    minLat?: number;
    maxLat?: number;
    minLng?: number;
    maxLng?: number;
    q?: string;
    province?: string;
    complexId?: string;
    category?: string;
    subCategory?: string;
    limit: number;
    offset: number;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    amenities?: string[];
    sortBy?: SortMode;
}
export declare class ListingRepository {
    private readonly pool;
    private readonly logger;
    constructor(pool: Pool);
    search(params: ListingSearchParams): Promise<any[]>;
    findNearby(params: any): Promise<any[]>;
    findById(id: string): Promise<any>;
}
