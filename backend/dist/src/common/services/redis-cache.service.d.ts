import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class RedisCacheService implements OnModuleInit, OnModuleDestroy {
    private config;
    private redis;
    private enabled;
    constructor(config: ConfigService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    invalidatePattern(pattern: string): Promise<void>;
}
