import { Global, Module } from '@nestjs/common';
import { catalogPoolProvider } from './catalog-read.pool';
import { recommendationPoolProvider } from './recommendation-write.pool';

@Global()
@Module({
  providers: [catalogPoolProvider, recommendationPoolProvider],
  exports: [catalogPoolProvider, recommendationPoolProvider],
})
export class DatabaseModule {}
