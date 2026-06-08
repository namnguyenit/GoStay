import { Module } from '@nestjs/common';
import { LocationResolver } from './location-resolver';
import { ComplexRepository } from './repositories/complex.repository';
import { LandmarkRepository } from './repositories/landmark.repository';
import { ListingRepository } from './repositories/listing.repository';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  controllers: [SearchController],
  providers: [
    LandmarkRepository,
    ListingRepository,
    ComplexRepository,
    LocationResolver,
    SearchService,
  ],
  exports: [LandmarkRepository, ListingRepository, ComplexRepository, SearchService],
})
export class SearchModule {}
