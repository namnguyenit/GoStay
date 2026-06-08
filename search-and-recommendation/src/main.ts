import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 8086;
  
  // enable CORS
  app.enableCors();
  
  await app.listen(port);
  logger.log(`Search & Recommendation Service is running on port ${port}`);
}
bootstrap();
