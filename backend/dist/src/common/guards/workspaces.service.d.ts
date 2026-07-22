import { PrismaService } from '../prisma/prisma.service';
import { WorkspaceType } from '@prisma/client';
export declare class WorkspacesService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAllForUser(userId: string): Promise<{
        memberRole: import(".prisma/client").$Enums.WorkspaceMemberRole;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        type: import(".prisma/client").$Enums.WorkspaceType;
        userId: string;
        enabledFeatures: string[];
    }[]>;
    findById(id: string, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        type: import(".prisma/client").$Enums.WorkspaceType;
        userId: string;
        enabledFeatures: string[];
    }>;
    create(userId: string, dto: {
        name: string;
        type: WorkspaceType;
        description?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        type: import(".prisma/client").$Enums.WorkspaceType;
        userId: string;
        enabledFeatures: string[];
    }>;
    createWithDefaults(userId: string, dto: {
        name: string;
        type: WorkspaceType;
        description?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        type: import(".prisma/client").$Enums.WorkspaceType;
        userId: string;
        enabledFeatures: string[];
    }>;
    update(id: string, userId: string, dto: {
        name?: string;
        enabledFeatures?: string[];
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        type: import(".prisma/client").$Enums.WorkspaceType;
        userId: string;
        enabledFeatures: string[];
    }>;
    remove(id: string, userId: string): Promise<void>;
    private createPersonalDefaults;
    private createBusinessDefaults;
}
