import { AIRecommendationsService } from './ai-recommendations.service';
export declare class AIRecommendationsController {
    private readonly service;
    constructor(service: AIRecommendationsService);
    findAll(req: any): Promise<{
        id: string;
        workspaceId: string;
        type: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue;
        userId: string;
        title: string;
        message: string;
        isRead: boolean;
        readAt: Date | null;
        priority: string;
        isDismissed: boolean;
        expiresAt: Date | null;
    }[]>;
    getPending(req: any): Promise<{
        id: string;
        workspaceId: string;
        type: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue;
        userId: string;
        title: string;
        message: string;
        isRead: boolean;
        readAt: Date | null;
        priority: string;
        isDismissed: boolean;
        expiresAt: Date | null;
    }[]>;
    generate(req: any): Promise<any[]>;
    markAsRead(id: string, req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    dismiss(id: string, req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
