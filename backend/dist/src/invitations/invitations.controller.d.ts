import { InvitationsService } from './invitations.service';
import { WorkspaceMemberRole } from '@prisma/client';
export declare class InvitationsController {
    private readonly service;
    constructor(service: InvitationsService);
    findAll(req: any): Promise<{
        id: string;
        code: string;
        email: string | null;
        role: import(".prisma/client").$Enums.WorkspaceMemberRole;
        displayName: string | null;
        maxUses: number;
        usesCount: number;
        expiresAt: Date;
        createdBy: string;
        createdAt: Date;
        usedAt: Date | null;
        workspaceId: string;
    }[]>;
    create(req: any, data: any): Promise<{
        id: string;
        code: string;
        email: string | null;
        role: import(".prisma/client").$Enums.WorkspaceMemberRole;
        displayName: string | null;
        maxUses: number;
        usesCount: number;
        expiresAt: Date;
        createdBy: string;
        createdAt: Date;
        usedAt: Date | null;
        workspaceId: string;
    }>;
    useInvitation(req: any, data: {
        code: string;
    }): Promise<{
        success: boolean;
        workspaceId: string;
        alreadyOwner: boolean;
        alreadyMember?: undefined;
    } | {
        success: boolean;
        workspaceId: string;
        alreadyMember: boolean;
        alreadyOwner?: undefined;
    } | {
        success: boolean;
        workspaceId: string;
        alreadyOwner?: undefined;
        alreadyMember?: undefined;
    }>;
    delete(req: any, id: string): Promise<{
        id: string;
        code: string;
        email: string | null;
        role: import(".prisma/client").$Enums.WorkspaceMemberRole;
        displayName: string | null;
        maxUses: number;
        usesCount: number;
        expiresAt: Date;
        createdBy: string;
        createdAt: Date;
        usedAt: Date | null;
        workspaceId: string;
    }>;
    update(id: string, req: any, data: {
        role?: WorkspaceMemberRole;
        displayName?: string;
        expiresAt?: string;
    }): Promise<{
        id: string;
        code: string;
        email: string | null;
        role: import(".prisma/client").$Enums.WorkspaceMemberRole;
        displayName: string | null;
        maxUses: number;
        usesCount: number;
        expiresAt: Date;
        createdBy: string;
        createdAt: Date;
        usedAt: Date | null;
        workspaceId: string;
    }>;
}
