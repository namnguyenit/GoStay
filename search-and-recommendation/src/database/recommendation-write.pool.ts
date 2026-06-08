import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

export const RECOMMENDATION_POOL = 'RECOMMENDATION_POOL';

export const recommendationPoolProvider: Provider = {
  provide: RECOMMENDATION_POOL,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new Pool({
      host: configService.get<string>('RECOMMENDATION_DB_HOST'),
      port: configService.get<number>('RECOMMENDATION_DB_PORT'),
      database: configService.get<string>('RECOMMENDATION_DB_NAME'),
      user: configService.get<string>('RECOMMENDATION_DB_USER'),
      password: configService.get<string>('RECOMMENDATION_DB_PASSWORD'),
    });
  },
};
