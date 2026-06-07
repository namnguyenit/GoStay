import { Injectable } from '@nestjs/common';
import { ComplexRepository } from '../search/repositories/complex.repository';
import { LandmarkRepository } from '../search/repositories/landmark.repository';
import { ListingRepository } from '../search/repositories/listing.repository';

@Injectable()
export class CandidateGenerator {
  constructor(
    private readonly listingRepo: ListingRepository,
    private readonly landmarkRepo: LandmarkRepository,
    private readonly complexRepo: ComplexRepository,
  ) {}

  async generateByCoordinate(
    lat: number,
    lng: number,
    radiusMeters: number = 10000,
    limit: number = 200,
    category: string = 'ALL',
  ) {
    return this.listingRepo.search({
      lat,
      lng,
      radiusMeters,
      category,
      limit,
      offset: 0,
    });
  }

  async generateForHome(
    province?: string,
    limit: number = 200,
    category: string = 'ALL',
  ) {
    return this.listingRepo.search({
      category,
      province,
      limit,
      offset: 0,
      sortBy: 'RELEVANCE' as any,
    });
  }

  async generateByLandmark(
    landmarkId: string,
    limit: number = 200,
    radiusMeters: number = 5000,
  ) {
    const landmark = await this.landmarkRepo.findById(landmarkId);
    if (!landmark) return [];

    return this.generateByCoordinate(
      landmark.latitude,
      landmark.longitude,
      radiusMeters,
      limit,
    );
  }

  async generateComplexes(limit: number = 120) {
    return this.complexRepo.findAll(limit);
  }

  async getComplexById(complexId: string) {
    return this.complexRepo.findById(complexId);
  }

  async generateComplexesByLandmark(
    landmarkId: string,
    radiusMeters: number = 5000,
    limit: number = 12,
  ) {
    const landmark = await this.landmarkRepo.findById(landmarkId);
    if (!landmark) return [];

    return this.complexRepo.findNearby(
      landmark.latitude,
      landmark.longitude,
      radiusMeters,
      limit,
    );
  }

  async generateByComplex(complexId: string, limit: number = 200) {
    return this.listingRepo.search({
      category: 'ALL',
      complexId,
      limit,
      offset: 0,
      sortBy: 'RELEVANCE' as any,
    });
  }

  async generateSimilar(listingId: string, limit: number = 50) {
    const listing = await this.listingRepo.findById(listingId);
    if (!listing) return [];
    if (listing.latitude == null || listing.longitude == null) return [];

    const candidates = await this.listingRepo.search({
      lat: listing.latitude,
      lng: listing.longitude,
      radiusMeters: 30000,
      category: 'ALL',
      limit,
      offset: 0,
    });

    return candidates
      .filter((c) => c.id !== listingId)
      .sort(
        (a, b) =>
          Number(a.distanceMeters ?? Number.MAX_SAFE_INTEGER) -
          Number(b.distanceMeters ?? Number.MAX_SAFE_INTEGER),
      );
  }

  async generateCrossSell(
    sourceListingId: string,
    cartIds: string[] = [],
    limit: number = 50,
  ) {
    const listing = await this.listingRepo.findById(sourceListingId);
    if (!listing) return [];

    const candidates = await this.listingRepo.search({
      lat: listing.latitude,
      lng: listing.longitude,
      radiusMeters: 15000, // 15km
      category: 'ALL',
      limit,
      offset: 0,
    });

    const set = new Set(cartIds);
    set.add(sourceListingId);

    return candidates.filter(
      (c) => !set.has(c.id) && c.category !== listing.category,
    );
  }

  async getHeroLandmarks(limit: number = 6) {
    return this.landmarkRepo.findFeatured(limit);
  }

  async getProvinces() {
    const [landmarkProvinces, complexProvinces] = await Promise.all([
      this.landmarkRepo.findPopularProvinces(50),
      this.complexRepo.findProvinceCounts(50),
    ]);

    const merged = new Map<string, any>();

    for (const province of landmarkProvinces) {
      merged.set(province.name, {
        ...province,
        complexCount: 0,
      });
    }

    for (const province of complexProvinces) {
      const current = merged.get(province.name) || {
        id: province.name,
        name: province.name,
        code: province.name,
        landmarkCount: 0,
        featuredLandmarkCount: 0,
      };
      merged.set(province.name, {
        ...current,
        complexCount: Number(province.complexCount || 0),
      });
    }

    return Array.from(merged.values())
      .sort((a, b) => {
        const aTotal = (a.landmarkCount || 0) + (a.complexCount || 0);
        const bTotal = (b.landmarkCount || 0) + (b.complexCount || 0);
        return (
          (b.featuredLandmarkCount || 0) - (a.featuredLandmarkCount || 0) ||
          bTotal - aTotal ||
          String(a.name).localeCompare(String(b.name))
        );
      })
      .slice(0, 20)
      .map((province, index) => ({
        ...province,
        rank: index + 1,
      }));
  }

  async generateProvinceDestinations(province: string, limit: number = 24) {
    const perTypeLimit = Math.max(1, Math.ceil(limit / 2));
    const [landmarks, complexes] = await Promise.all([
      this.landmarkRepo.findByProvince(province, perTypeLimit),
      this.complexRepo.findByProvince(province, perTypeLimit),
    ]);

    return [
      ...landmarks.map((item) => ({
        ...item,
        type: 'LANDMARK',
        destinationType: 'LANDMARK',
      })),
      ...complexes.map((item) => ({
        ...item,
        type: 'COMPLEX',
        destinationType: 'COMPLEX',
      })),
    ].slice(0, limit);
  }
}
