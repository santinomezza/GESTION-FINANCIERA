import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationType } from '@prisma/client';
export declare class NotificationsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        userId: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        title: string;
        message: string;
        isRead: boolean;
        readAt: Date | null;
        sentAt: Date | null;
    }[]>;
    markRead(userId: string, id: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    delete(userId: string, id: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getUnreadCount(userId: string): Promise<number>;
    create(userId: string, data: {
        type: NotificationType;
        title: string;
        message: string;
        data?: any;
    }): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        userId: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        title: string;
        message: string;
        isRead: boolean;
        readAt: Date | null;
        sentAt: Date | null;
    }>;
    createMonthlySummary(userId: string, workspaceId: string, summaryData: any): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        userId: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        title: string;
        message: string;
        isRead: boolean;
        readAt: Date | null;
        sentAt: Date | null;
    }>;
    createCategoryLimitAlert(userId: string, categoryName: string, percentage: number, spent: number, limit: number): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        userId: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        title: string;
        message: string;
        isRead: boolean;
        readAt: Date | null;
        sentAt: Date | null;
    }>;
    createRecurringReminder(userId: string, transactionName: string, amount: number): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        userId: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        title: string;
        message: string;
        isRead: boolean;
        readAt: Date | null;
        sentAt: Date | null;
    }>;
    createAIRecommendation(userId: string, title: string, message: string, priority?: string, data?: any): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        userId: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        title: string;
        message: string;
        isRead: boolean;
        readAt: Date | null;
        sentAt: Date | null;
    }>;
    getUnreadNotifications(userId: string): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        userId: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        title: string;
        message: string;
        isRead: boolean;
        readAt: Date | null;
        sentAt: Date | null;
    }[]>;
}
