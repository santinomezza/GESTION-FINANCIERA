import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { EmailService } from './services/email.service';
import { RedisCacheService } from './services/redis-cache.service';

@Global()
@Module({
    providers: [PrismaService, EmailService, RedisCacheService],
    exports: [PrismaService, EmailService, RedisCacheService],
})
export class CommonModule { }
