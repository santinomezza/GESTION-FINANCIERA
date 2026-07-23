import { PrismaService } from '../common/prisma/prisma.service';
export declare class AIRecommendationsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(userId: string, workspaceId?: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        userId: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        workspaceId: string;
        title: string;
        message: string;
        priority: string;
        isRead: boolean;
        isDismissed: boolean;
        expiresAt: Date | null;
        readAt: Date | null;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        userId: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        workspaceId: string;
        title: string;
        message: string;
        priority: string;
        isRead: boolean;
        isDismissed: boolean;
        expiresAt: Date | null;
        readAt: Date | null;
    }>;
    create(userId: string, workspaceId: string, data: {
        type: string;
        title: string;
        message: string;
        priority?: string;
        data?: any;
        expiresAt?: Date;
    }): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        userId: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        workspaceId: string;
        title: string;
        message: string;
        priority: string;
        isRead: boolean;
        isDismissed: boolean;
        expiresAt: Date | null;
        readAt: Date | null;
    }>;
    markAsRead(id: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    dismiss(id: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    generateRecommendations(userId: string, workspaceId: string): Promise<any[]>;
    getPendingRecommendations(userId: string, workspaceId: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        userId: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        workspaceId: string;
        title: string;
        message: string;
        priority: string;
        isRead: boolean;
        isDismissed: boolean;
        expiresAt: Date | null;
        readAt: Date | null;
    }[]>;
}
