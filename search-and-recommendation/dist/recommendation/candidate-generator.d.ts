import { ComplexRepository } from '../search/repositories/complex.repository';
import { LandmarkRepository } from '../search/repositories/landmark.repository';
import { ListingRepository } from '../search/repositories/listing.repository';
export declare class CandidateGenerator {
    private readonly listingRepo;
    private readonly landmarkRepo;
    private readonly complexRepo;
    constructor(listingRepo: ListingRepository, landmarkRepo: LandmarkRepository, complexRepo: ComplexRepository);
    generateByCoordinate(lat: number, lng: number, radiusMeters?: number, limit?: number, category?: string): Promise<any[]>;
    generateForHome(province?: string, limit?: number, category?: string): Promise<any[]>;
    generateByLandmark(landmarkId: string, limit?: number, radiusMeters?: number): Promise<any[]>;
    generateComplexes(limit?: number): Promise<any[]>;
    getComplexById(complexId: string): Promise<any>;
    generateComplexesByLandmark(landmarkId: string, radiusMeters?: number, limit?: number): Promise<any[]>;
    generateByComplex(complexId: string, limit?: number): Promise<any[]>;
    generateSimilar(listingId: string, limit?: number): Promise<any[]>;
    generateCrossSell(sourceListingId: string, cartIds?: string[], limit?: number): Promise<any[]>;
    getHeroLandmarks(limit?: number): Promise<import("../search/repositories/landmark.repository").LandmarkCandidate[]>;
    getProvinces(): Promise<any[]>;
    generateProvinceDestinations(province: string, limit?: number): Promise<any[]>;
}
