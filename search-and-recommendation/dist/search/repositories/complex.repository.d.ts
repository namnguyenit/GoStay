import { Pool } from 'pg';
export declare class ComplexRepository {
    private readonly pool;
    private readonly logger;
    constructor(pool: Pool);
    autocomplete(query: string, limit?: number): Promise<any[]>;
    findById(id: string): Promise<any>;
    findByProvince(province: string, limit?: number): Promise<any[]>;
    findAll(limit?: number): Promise<any[]>;
    findNearby(lat: number, lng: number, radiusMeters?: number, limit?: number): Promise<any[]>;
    findProvinceCounts(limit?: number): Promise<any[]>;
}
