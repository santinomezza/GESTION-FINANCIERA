import { AIRecommendationsService } from './ai-recommendations.service';
export declare class AIRecommendationsController {
    private readonly service;
    constructor(service: AIRecommendationsService);
    findAll(req: any): Promise<{
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
    getPending(req: any): Promise<{
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
    generate(req: any): Promise<any[]>;
    markAsRead(id: string, req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    dismiss(id: string, req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
