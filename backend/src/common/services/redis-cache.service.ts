import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis | null = null;
  private enabled = false;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    const url = this.config.get('redis.url');
    if (!url) return;
    try {
      this.redis = new Redis(url, {
        password: this.config.get('redis.password') || undefined,
        connectTimeout: 1000,
        lazyConnect: true,
      });
      this.redis.on('error', () => {
        this.enabled = false;
      });
      this.redis.on('connect', () => {
        this.enabled = true;
      });
      this.redis.connect().catch(() => {
        this.enabled = false;
      });
    } catch {
      this.enabled = false;
    }
  }

  onModuleDestroy() {
    if (this.redis) {
      this.redis.quit().catch(() => {});
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.enabled || !this.redis) return null;
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds = 300) {
    if (!this.enabled || !this.redis) return;
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // Silently fail - cache is optional
    }
  }

  async del(key: string) {
    if (!this.enabled || !this.redis) return;
    try {
      await this.redis.del(key);
    } catch {
      // Silently fail
    }
  }

  async invalidatePattern(pattern: string) {
    if (!this.enabled || !this.redis) return;
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch {
      // Silently fail
    }
  }
}
