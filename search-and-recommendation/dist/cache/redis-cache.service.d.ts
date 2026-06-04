import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export declare class RedisCacheService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private redis;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    getClient(): Redis;
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttlSeconds: number): Promise<void>;
}
