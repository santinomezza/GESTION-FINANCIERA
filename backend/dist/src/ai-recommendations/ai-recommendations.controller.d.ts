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
        expiresAt: Date | null;
        message: string;
        isRead: boolean;
        readAt: Date | null;
        priority: string;
        isDismissed: boolean;
    }[]>;
    getPending(req: any): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        userId: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        workspaceId: string;
        title: string;
        expiresAt: Date | null;
        message: string;
        isRead: boolean;
        readAt: Date | null;
        priority: string;
        isDismissed: boolean;
    }[]>;
    generate(req: any): Promise<any[]>;
    markAsRead(id: string, req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    dismiss(id: string, req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
