import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.redis = new Redis(this.configService.get<string>('REDIS_URL')!);
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }

  getClient(): Redis {
    return this.redis;
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number): Promise<void> {
    const data = JSON.stringify(value);
    await this.redis.set(key, data, 'EX', ttlSeconds);
  }
}
