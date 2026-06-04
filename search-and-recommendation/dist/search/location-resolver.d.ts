import { ComplexRepository } from './repositories/complex.repository';
import { LandmarkRepository } from './repositories/landmark.repository';
export declare class LocationResolver {
    private readonly landmarkRepo;
    private readonly complexRepo;
    private readonly logger;
    constructor(landmarkRepo: LandmarkRepository, complexRepo: ComplexRepository);
    suggestLocations(query: string): Promise<any[]>;
    resolveLocation(query: string): Promise<any>;
}
