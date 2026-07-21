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
        workspaceId: string;
        userId: string;
        role: import(".prisma/client").$Enums.WorkspaceMemberRole;
        displayName: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        invitedBy: string | null;
        invitedAt: Date;
        joinedAt: Date | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    })[]>;
    findOne(id: string, workspaceId: string): Promise<{
        user: {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            email: string;
            name: string;
            passwordHash: string;
            avatarUrl: string | null;
            telegramId: string | null;
            telegramUsername: string | null;
            telegramLinkedAt: Date | null;
            preferences: import("@prisma/client/runtime/library").JsonValue;
            lastLoginAt: Date | null;
        };
    } & {
        id: string;
        workspaceId: string;
        userId: string;
        role: import(".prisma/client").$Enums.WorkspaceMemberRole;
        displayName: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        invitedBy: string | null;
        invitedAt: Date;
        joinedAt: Date | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    invite(workspaceId: string, data: {
        userId: string;
        role?: WorkspaceMemberRole;
        displayName?: string;
        invitedBy: string;
    }): Promise<{
        user: {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            email: string;
            name: string;
            passwordHash: string;
            avatarUrl: string | null;
            telegramId: string | null;
            telegramUsername: string | null;
            telegramLinkedAt: Date | null;
            preferences: import("@prisma/client/runtime/library").JsonValue;
            lastLoginAt: Date | null;
        };
    } & {
        id: string;
        workspaceId: string;
        userId: string;
        role: import(".prisma/client").$Enums.WorkspaceMemberRole;
        displayName: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        invitedBy: string | null;
        invitedAt: Date;
        joinedAt: Date | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    updateRole(id: string, workspaceId: string, role: WorkspaceMemberRole, displayName?: string): Promise<{
        user: {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            email: string;
            name: string;
            passwordHash: string;
            avatarUrl: string | null;
            telegramId: string | null;
            telegramUsername: string | null;
            telegramLinkedAt: Date | null;
            preferences: import("@prisma/client/runtime/library").JsonValue;
            lastLoginAt: Date | null;
        };
    } & {
        id: string;
        workspaceId: string;
        userId: string;
        role: import(".prisma/client").$Enums.WorkspaceMemberRole;
        displayName: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        invitedBy: string | null;
        invitedAt: Date;
        joinedAt: Date | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    remove(id: string, workspaceId: string): Promise<{
        id: string;
        workspaceId: string;
        userId: string;
        role: import(".prisma/client").$Enums.WorkspaceMemberRole;
        displayName: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        invitedBy: string | null;
        invitedAt: Date;
        joinedAt: Date | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    checkPermission(workspaceId: string, userId: string, requiredRole: WorkspaceMemberRole): Promise<boolean>;
    getWorkspaceOwner(workspaceId: string): Promise<{
        user: {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            email: string;
            name: string;
            passwordHash: string;
            avatarUrl: string | null;
            telegramId: string | null;
            telegramUsername: string | null;
            telegramLinkedAt: Date | null;
            preferences: import("@prisma/client/runtime/library").JsonValue;
            lastLoginAt: Date | null;
        };
    } & {
        id: string;
        workspaceId: string;
        userId: string;
        role: import(".prisma/client").$Enums.WorkspaceMemberRole;
        displayName: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        invitedBy: string | null;
        invitedAt: Date;
        joinedAt: Date | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
}
