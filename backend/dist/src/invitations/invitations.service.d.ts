import { PrismaService } from '../common/prisma/prisma.service';
import { WorkspaceMemberRole } from '@prisma/client';
export declare class InvitationsService {
    private prisma;
    constructor(prisma: PrismaService);
    private generateCode;
    create(workspaceId: string, data: {
        code?: string;
        email?: string;
        role?: WorkspaceMemberRole;
        displayName?: string;
        maxUses?: number;
        expiresAt?: Date;
        createdBy: string;
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
    findByCode(code: string): Promise<{
        workspace: {
            id: string;
            createdAt: Date;
            name: string;
            type: import(".prisma/client").$Enums.WorkspaceType;
            userId: string;
            enabledFeatures: string[];
            updatedAt: Date;
            deletedAt: Date | null;
        };
    } & {
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
    useInvitation(code: string, userId: string): Promise<{
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
    findAll(workspaceId: string): Promise<{
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
    update(id: string, workspaceId: string, data: {
        role?: WorkspaceMemberRole;
        displayName?: string;
        expiresAt?: Date;
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
    delete(id: string, workspaceId: string): Promise<{
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
