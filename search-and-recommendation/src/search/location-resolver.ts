import { Injectable, Logger } from '@nestjs/common';
import { ComplexRepository } from './repositories/complex.repository';
import { LandmarkRepository } from './repositories/landmark.repository';

@Injectable()
export class LocationResolver {
  private readonly logger = new Logger(LocationResolver.name);

  constructor(
    private readonly landmarkRepo: LandmarkRepository,
    private readonly complexRepo: ComplexRepository,
  ) {}

  async suggestLocations(query: string): Promise<any[]> {
    if (!query) {
      return [];
    }

    try {
      const [landmarks, complexes, provinces] = await Promise.all([
        this.landmarkRepo.autocomplete(query, 5),
        this.complexRepo.autocomplete(query, 5),
        this.landmarkRepo.findProvinceSuggestions(query, 5),
      ]);

      return [
        ...landmarks.map((item) => ({
          type: 'LANDMARK',
          id: item.id,
          name: item.name,
          province: item.province,
          latitude: item.latitude,
          longitude: item.longitude,
          radiusMeters: item.radiusMeters,
          thumbnailUrl: item.thumbnailUrl,
          textScore: item.textScore || 0,
          priority: 3,
        })),
        ...complexes.map((item) => ({
          type: 'COMPLEX',
          id: item.id,
          name: item.name,
          province: item.province,
          latitude: item.latitude,
          longitude: item.longitude,
          thumbnailUrl: item.thumbnailUrl,
          textScore: item.textScore || 0,
          priority: 2,
        })),
        ...provinces.map((item) => ({
          type: 'PROVINCE',
          name: item.name,
          province: item.name,
          textScore: item.textScore || 0,
          priority: 1,
        })),
      ].sort((a, b) => (b.textScore - a.textScore) || (b.priority - a.priority));
    } catch (error) {
      this.logger.error(`Error suggesting locations: ${error.message}`);
      return [];
    }
  }

  async resolveLocation(query: string): Promise<any> {
    if (!query) {
      return null;
    }

    try {
      const suggestions = await this.suggestLocations(query);

      if (suggestions.length === 0) {
        return null;
      }

      const topMatch = suggestions[0];

      if (topMatch.type === 'PROVINCE') {
        return {
          resolvedType: 'PROVINCE',
          province: topMatch.province,
          suggestions,
        };
      }

      if (topMatch.type === 'COMPLEX') {
        return {
          resolvedType: 'COMPLEX',
          complexId: topMatch.id,
          latitude: topMatch.latitude,
          longitude: topMatch.longitude,
          province: topMatch.province,
          suggestions,
        };
      }

      return {
        resolvedType: 'LANDMARK',
        landmarkId: topMatch.id,
        latitude: topMatch.latitude,
        longitude: topMatch.longitude,
        radiusMeters: topMatch.radiusMeters,
        province: topMatch.province,
        suggestions,
      };
    } catch (error) {
      this.logger.error(`Error resolving location: ${error.message}`);
      return null;
    }
  }
}
