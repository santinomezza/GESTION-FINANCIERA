import { PrismaService } from '../common/prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<{
        id: string;
        email: string;
        telegramId: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        avatarUrl: string;
        isActive: boolean;
        telegramUsername: string;
        telegramLinkedAt: Date;
        preferences: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        lastLoginAt: Date;
    }>;
    updateProfile(userId: string, data: {
        name?: string;
        avatarUrl?: string;
        preferences?: any;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        avatarUrl: string;
        preferences: import("@prisma/client/runtime/library").JsonValue;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    linkTelegram(userId: string, telegramId: string, telegramUsername?: string): Promise<{
        id: string;
        telegramId: string;
        telegramUsername: string;
        telegramLinkedAt: Date;
    }>;
    unlinkTelegram(userId: string): Promise<{
        id: string;
        telegramId: string;
    }>;
    findAll(): Promise<{
        id: string;
        email: string;
        telegramId: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        createdAt: Date;
        lastLoginAt: Date;
    }[]>;
    deleteAccount(userId: string): Promise<{
        message: string;
    }>;
}
