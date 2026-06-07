import { RedisCacheService } from '../cache/redis-cache.service';
import { InventoryClient } from '../inventory/inventory.client';
import { LocationResolver } from './location-resolver';
import { LandmarkRepository } from './repositories/landmark.repository';
import { ListingRepository } from './repositories/listing.repository';
import { SearchQueryDto } from './search.dto';
export declare class SearchService {
    private readonly listingRepo;
    private readonly landmarkRepo;
    private readonly locationResolver;
    private readonly inventoryClient;
    private readonly cacheService;
    private readonly logger;
    constructor(listingRepo: ListingRepository, landmarkRepo: LandmarkRepository, locationResolver: LocationResolver, inventoryClient: InventoryClient, cacheService: RedisCacheService);
    private getTodayIso;
    suggestLocations(query: string): Promise<any[]>;
    searchListings(dto: SearchQueryDto): Promise<any>;
    searchMap(dto: SearchQueryDto): Promise<{
        mode: string;
        total: any;
        data: any;
    }>;
}
