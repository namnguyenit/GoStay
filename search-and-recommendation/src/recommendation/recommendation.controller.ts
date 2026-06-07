import { Controller, Get, Param, Query, ValidationPipe } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import {
  HomeFeedQueryDto,
  NearbyRecommendationQueryDto,
} from './recommendation.dto';

@Controller('api/v1/recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get('home/hero-landmarks')
  async getHeroLandmarks() {
    return this.recommendationService.getHeroLandmarks();
  }

  @Get('home/feed')
  async getHomeFeed(
    @Query(new ValidationPipe({ transform: true })) dto: HomeFeedQueryDto,
  ) {
    return this.recommendationService.getHomeFeed(dto);
  }

  @Get('provinces')
  async getProvinces() {
    return this.recommendationService.getProvinces();
  }

  @Get('provinces/:province/destinations')
  async getProvinceDestinations(@Param('province') province: string) {
    return this.recommendationService.getProvinceDestinations(province);
  }

  @Get('complexes')
  async getComplexes(@Query('limit') limit?: string) {
    const parsedLimit = Number(limit);
    return this.recommendationService.getComplexes(
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 120,
    );
  }

  @Get('complexes/:id')
  async getComplexRecommendations(@Param('id') id: string) {
    return this.recommendationService.recommendByComplex(id);
  }

  // Keep old ones for backward compat with my own prior implementation
  @Get('home')
  async getHomeRecommendations(@Query('province') province?: string) {
    return this.recommendationService.recommendForHome(province);
  }

  @Get('nearby')
  async getNearbyRecommendations(
    @Query(new ValidationPipe({ transform: true }))
    dto: NearbyRecommendationQueryDto,
  ) {
    return this.recommendationService.getHomeFeed(dto);
  }

  @Get('landmarks/:landmarkId')
  async getByLandmark(
    @Param('landmarkId') landmarkId: string,
    @Query('radius') radius?: string,
    @Query('radiusMeters') radiusMeters?: string,
  ) {
    const parsedRadius = Number(radiusMeters ?? radius);
    return this.recommendationService.recommendByLandmarkGrouped(
      landmarkId,
      Number.isFinite(parsedRadius) && parsedRadius > 0 ? parsedRadius : 5000,
    );
  }

  @Get('listings/:listingId/similar')
  async getSimilar(
    @Param('listingId') listingId: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = Number(limit);
    return this.recommendationService.recommendSimilar(
      listingId,
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 30,
    );
  }
}
