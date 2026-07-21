import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly service;
    constructor(service: NotificationsService);
    findAll(req: any): Promise<{
        id: string;
        userId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        isRead: boolean;
        sentAt: Date | null;
        readAt: Date | null;
        createdAt: Date;
    }[]>;
    getUnread(req: any): Promise<{
        id: string;
        userId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        isRead: boolean;
        sentAt: Date | null;
        readAt: Date | null;
        createdAt: Date;
    }[]>;
    getUnreadCount(req: any): Promise<number>;
    markRead(req: any, id: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllRead(req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    delete(req: any, id: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
