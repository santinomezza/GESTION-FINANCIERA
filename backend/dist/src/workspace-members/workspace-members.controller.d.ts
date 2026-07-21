import { WorkspaceMembersService } from './workspace-members.service';
import { WorkspaceMemberRole } from '@prisma/client';
export declare class WorkspaceMembersController {
    private readonly service;
    constructor(service: WorkspaceMembersService);
    findAll(req: any): Promise<({
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
    findOne(id: string, req: any): Promise<{
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
    invite(req: any, data: {
        userId: string;
        role?: WorkspaceMemberRole;
        displayName?: string;
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
    updateRole(id: string, req: any, data: {
        role: WorkspaceMemberRole;
        displayName?: string;
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
    remove(id: string, req: any): Promise<{
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
