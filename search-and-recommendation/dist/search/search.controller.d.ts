import { SearchQueryDto } from './search.dto';
import { SearchService } from './search.service';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    suggestLocations(query: string): Promise<any[]>;
    autocompleteLandmarks(query: string): Promise<any[]>;
    searchListings(dto: SearchQueryDto): Promise<any>;
    searchNearby(dto: SearchQueryDto): Promise<any>;
    searchMap(dto: SearchQueryDto): Promise<{
        mode: string;
        total: any;
        data: any;
    }>;
}
