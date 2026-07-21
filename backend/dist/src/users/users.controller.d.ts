import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getMe(userId: string): Promise<{
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
    updateMe(userId: string, body: {
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
    changePassword(userId: string, body: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    linkTelegram(userId: string, body: {
        telegramId: string;
        telegramUsername?: string;
    }): Promise<{
        id: string;
        telegramId: string;
        telegramUsername: string;
        telegramLinkedAt: Date;
    }>;
    unlinkTelegram(userId: string): Promise<{
        id: string;
        telegramId: string;
    }>;
    deleteAccount(userId: string): Promise<{
        message: string;
    }>;
}
