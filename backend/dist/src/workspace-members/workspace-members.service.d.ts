import { PrismaService } from '../common/prisma/prisma.service';
import { WorkspaceMemberRole } from '@prisma/client';
export declare class WorkspaceMembersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(workspaceId: string): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
            avatarUrl: string;
        };
    } & {
        id: string;
        role: import(".prisma/client").$Enums.WorkspaceMemberRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        userId: string;
        workspaceId: string;
        displayName: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        invitedBy: string | null;
        invitedAt: Date;
        joinedAt: Date | null;
    })[]>;
    findOne(id: string, workspaceId: string): Promise<{
        user: {
            id: string;
            email: string;
            telegramId: string | null;
            name: string;
            passwordHash: string;
            role: import(".prisma/client").$Enums.UserRole;
            avatarUrl: string | null;
            isActive: boolean;
            telegramUsername: string | null;
            telegramLinkedAt: Date | null;
            preferences: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            lastLoginAt: Date | null;
        };
    } & {
        id: string;
        role: import(".prisma/client").$Enums.WorkspaceMemberRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        userId: string;
        workspaceId: string;
        displayName: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        invitedBy: string | null;
        invitedAt: Date;
        joinedAt: Date | null;
    }>;
    invite(workspaceId: string, data: {
        userId: string;
        role?: WorkspaceMemberRole;
        displayName?: string;
        invitedBy: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            telegramId: string | null;
            name: string;
            passwordHash: string;
            role: import(".prisma/client").$Enums.UserRole;
            avatarUrl: string | null;
            isActive: boolean;
            telegramUsername: string | null;
            telegramLinkedAt: Date | null;
            preferences: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            lastLoginAt: Date | null;
        };
    } & {
        id: string;
        role: import(".prisma/client").$Enums.WorkspaceMemberRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        userId: string;
        workspaceId: string;
        displayName: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        invitedBy: string | null;
        invitedAt: Date;
        joinedAt: Date | null;
    }>;
    updateRole(id: string, workspaceId: string, role: WorkspaceMemberRole, displayName?: string): Promise<{
        user: {
            id: string;
            email: string;
            telegramId: string | null;
            name: string;
            passwordHash: string;
            role: import(".prisma/client").$Enums.UserRole;
            avatarUrl: string | null;
            isActive: boolean;
            telegramUsername: string | null;
            telegramLinkedAt: Date | null;
            preferences: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            lastLoginAt: Date | null;
        };
    } & {
        id: string;
        role: import(".prisma/client").$Enums.WorkspaceMemberRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        userId: string;
        workspaceId: string;
        displayName: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        invitedBy: string | null;
        invitedAt: Date;
        joinedAt: Date | null;
    }>;
    remove(id: string, workspaceId: string): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.WorkspaceMemberRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        userId: string;
        workspaceId: string;
        displayName: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        invitedBy: string | null;
        invitedAt: Date;
        joinedAt: Date | null;
    }>;
    checkPermission(workspaceId: string, userId: string, requiredRole: WorkspaceMemberRole): Promise<boolean>;
    getWorkspaceOwner(workspaceId: string): Promise<{
        user: {
            id: string;
            email: string;
            telegramId: string | null;
            name: string;
            passwordHash: string;
            role: import(".prisma/client").$Enums.UserRole;
            avatarUrl: string | null;
            isActive: boolean;
            telegramUsername: string | null;
            telegramLinkedAt: Date | null;
            preferences: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            lastLoginAt: Date | null;
        };
    } & {
        id: string;
        role: import(".prisma/client").$Enums.WorkspaceMemberRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        userId: string;
        workspaceId: string;
        displayName: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        invitedBy: string | null;
        invitedAt: Date;
        joinedAt: Date | null;
    }>;
}
