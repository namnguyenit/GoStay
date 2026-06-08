import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { SearchQueryDto } from './search.dto';
import { SearchService } from './search.service';

@Controller('api/v1/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('locations/suggest')
  async suggestLocations(@Query('q') query: string) {
    return this.searchService.suggestLocations(query);
  }

  @Get('landmarks/autocomplete')
  async autocompleteLandmarks(@Query('q') query: string) {
    return this.searchService.suggestLocations(query);
  }

  @Get('listings')
  async searchListings(
    @Query(new ValidationPipe({ transform: true })) dto: SearchQueryDto,
  ) {
    return this.searchService.searchListings(dto);
  }

  @Get('listings/nearby')
  async searchNearby(
    @Query(new ValidationPipe({ transform: true })) dto: SearchQueryDto,
  ) {
    if (!dto.radiusMeters) dto.radiusMeters = 3000;
    return this.searchService.searchListings(dto);
  }

  @Get('map')
  async searchMap(
    @Query(new ValidationPipe({ transform: true })) dto: SearchQueryDto,
  ) {
    return this.searchService.searchMap(dto);
  }
}
