import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private config;
    private prisma;
    constructor(config: ConfigService, prisma: PrismaService);
    validate(payload: any): Promise<{
        sub: string;
        id: string;
        email: string;
        telegramId: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        avatarUrl: string;
        telegramUsername: string;
        createdAt: Date;
    }>;
}
export {};
