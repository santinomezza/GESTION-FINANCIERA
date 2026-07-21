"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCacheService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
const config_1 = require("@nestjs/config");
let RedisCacheService = class RedisCacheService {
    constructor(config) {
        this.config = config;
        this.redis = null;
        this.enabled = false;
    }
    onModuleInit() {
        const url = this.config.get('redis.url');
        if (!url)
            return;
        try {
            this.redis = new ioredis_1.default(url, {
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
        }
        catch {
            this.enabled = false;
        }
    }
    onModuleDestroy() {
        if (this.redis) {
            this.redis.quit().catch(() => { });
        }
    }
    async get(key) {
        if (!this.enabled || !this.redis)
            return null;
        try {
            const value = await this.redis.get(key);
            return value ? JSON.parse(value) : null;
        }
        catch {
            return null;
        }
    }
    async set(key, value, ttlSeconds = 300) {
        if (!this.enabled || !this.redis)
            return;
        try {
            await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        }
        catch {
        }
    }
    async del(key) {
        if (!this.enabled || !this.redis)
            return;
        try {
            await this.redis.del(key);
        }
        catch {
        }
    }
    async invalidatePattern(pattern) {
        if (!this.enabled || !this.redis)
            return;
        try {
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        }
        catch {
        }
    }
};
exports.RedisCacheService = RedisCacheService;
exports.RedisCacheService = RedisCacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisCacheService);
//# sourceMappingURL=redis-cache.service.js.map