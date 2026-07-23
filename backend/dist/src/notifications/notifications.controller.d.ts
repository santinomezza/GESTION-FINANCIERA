import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly service;
    constructor(service: NotificationsService);
    findAll(req: any): Promise<{
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
    getUnread(req: any): Promise<{
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
    getUnreadCount(req: any): Promise<number>;
    markRead(req: any, id: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllRead(req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    delete(req: any, id: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
