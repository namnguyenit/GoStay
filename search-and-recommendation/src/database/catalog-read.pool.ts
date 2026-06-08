import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

export const CATALOG_POOL = 'CATALOG_POOL';

export const catalogPoolProvider: Provider = {
  provide: CATALOG_POOL,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new Pool({
      host: configService.get<string>('CATALOG_DB_HOST'),
      port: configService.get<number>('CATALOG_DB_PORT'),
      database: configService.get<string>('CATALOG_DB_NAME'),
      user: configService.get<string>('CATALOG_DB_USER'),
      password: configService.get<string>('CATALOG_DB_PASSWORD'),
      // read-only settings can be configured via user privileges on DB
      // but we connect simply here.
    });
  },
};
