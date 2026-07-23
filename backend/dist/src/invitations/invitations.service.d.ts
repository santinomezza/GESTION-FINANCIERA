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
        email: string | null;
        role: import(".prisma/client").$Enums.WorkspaceMemberRole;
        createdAt: Date;
        workspaceId: string;
        createdBy: string;
        expiresAt: Date;
        usedAt: Date | null;
        displayName: string | null;
        code: string;
        maxUses: number;
        usesCount: number;
    }>;
    findByCode(code: string): Promise<{
        workspace: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            type: import(".prisma/client").$Enums.WorkspaceType;
            userId: string;
            enabledFeatures: string[];
        };
    } & {
        id: string;
        email: string | null;
        role: import(".prisma/client").$Enums.WorkspaceMemberRole;
        createdAt: Date;
        workspaceId: string;
        createdBy: string;
        expiresAt: Date;
        usedAt: Date | null;
        displayName: string | null;
        code: string;
        maxUses: number;
        usesCount: number;
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
        email: string | null;
        role: import(".prisma/client").$Enums.WorkspaceMemberRole;
        createdAt: Date;
        workspaceId: string;
        createdBy: string;
        expiresAt: Date;
        usedAt: Date | null;
        displayName: string | null;
        code: string;
        maxUses: number;
        usesCount: number;
    }[]>;
    update(id: string, workspaceId: string, data: {
        role?: WorkspaceMemberRole;
        displayName?: string;
        expiresAt?: Date;
    }): Promise<{
        id: string;
        email: string | null;
        role: import(".prisma/client").$Enums.WorkspaceMemberRole;
        createdAt: Date;
        workspaceId: string;
        createdBy: string;
        expiresAt: Date;
        usedAt: Date | null;
        displayName: string | null;
        code: string;
        maxUses: number;
        usesCount: number;
    }>;
    delete(id: string, workspaceId: string): Promise<{
        id: string;
        email: string | null;
        role: import(".prisma/client").$Enums.WorkspaceMemberRole;
        createdAt: Date;
        workspaceId: string;
        createdBy: string;
        expiresAt: Date;
        usedAt: Date | null;
        displayName: string | null;
        code: string;
        maxUses: number;
        usesCount: number;
    }>;
}
