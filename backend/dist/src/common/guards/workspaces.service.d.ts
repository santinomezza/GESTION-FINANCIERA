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
        type: import(".prisma/client").$Enums.WorkspaceType;
        userId: string;
        enabledFeatures: string[];
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }[]>;
    findById(id: string, userId: string): Promise<{
        id: string;
        name: string;
        type: import(".prisma/client").$Enums.WorkspaceType;
        userId: string;
        enabledFeatures: string[];
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    create(userId: string, dto: {
        name: string;
        type: WorkspaceType;
        description?: string;
    }): Promise<{
        id: string;
        name: string;
        type: import(".prisma/client").$Enums.WorkspaceType;
        userId: string;
        enabledFeatures: string[];
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    createWithDefaults(userId: string, dto: {
        name: string;
        type: WorkspaceType;
        description?: string;
    }): Promise<{
        id: string;
        name: string;
        type: import(".prisma/client").$Enums.WorkspaceType;
        userId: string;
        enabledFeatures: string[];
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    update(id: string, userId: string, dto: {
        name?: string;
        enabledFeatures?: string[];
    }): Promise<{
        id: string;
        name: string;
        type: import(".prisma/client").$Enums.WorkspaceType;
        userId: string;
        enabledFeatures: string[];
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    remove(id: string, userId: string): Promise<void>;
    private createPersonalDefaults;
    private createBusinessDefaults;
}
