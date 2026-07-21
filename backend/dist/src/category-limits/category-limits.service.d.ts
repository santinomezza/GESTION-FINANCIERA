import { PrismaService } from '../common/prisma/prisma.service';
export declare class CategoryLimitsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(workspaceId: string): Promise<({
        category: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            type: import(".prisma/client").$Enums.CategoryType;
            workspaceId: string;
            icon: string;
            color: string;
            description: string | null;
            isFavorite: boolean;
            sortOrder: number;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        workspaceId: string;
        categoryId: string;
        limitAmount: import("@prisma/client/runtime/library").Decimal;
        period: string;
        alertEnabled: boolean;
        alertThreshold: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findOne(id: string, workspaceId: string): Promise<{
        category: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            type: import(".prisma/client").$Enums.CategoryType;
            workspaceId: string;
            icon: string;
            color: string;
            description: string | null;
            isFavorite: boolean;
            sortOrder: number;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        workspaceId: string;
        categoryId: string;
        limitAmount: import("@prisma/client/runtime/library").Decimal;
        period: string;
        alertEnabled: boolean;
        alertThreshold: import("@prisma/client/runtime/library").Decimal;
    }>;
    create(workspaceId: string, data: {
        categoryId: string;
        limitAmount: number;
        period?: string;
        alertEnabled?: boolean;
        alertThreshold?: number;
    }): Promise<{
        category: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            type: import(".prisma/client").$Enums.CategoryType;
            workspaceId: string;
            icon: string;
            color: string;
            description: string | null;
            isFavorite: boolean;
            sortOrder: number;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        workspaceId: string;
        categoryId: string;
        limitAmount: import("@prisma/client/runtime/library").Decimal;
        period: string;
        alertEnabled: boolean;
        alertThreshold: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(id: string, workspaceId: string, data: {
        limitAmount?: number;
        period?: string;
        alertEnabled?: boolean;
        alertThreshold?: number;
        isActive?: boolean;
    }): Promise<{
        category: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            type: import(".prisma/client").$Enums.CategoryType;
            workspaceId: string;
            icon: string;
            color: string;
            description: string | null;
            isFavorite: boolean;
            sortOrder: number;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        workspaceId: string;
        categoryId: string;
        limitAmount: import("@prisma/client/runtime/library").Decimal;
        period: string;
        alertEnabled: boolean;
        alertThreshold: import("@prisma/client/runtime/library").Decimal;
    }>;
    delete(id: string, workspaceId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        workspaceId: string;
        categoryId: string;
        limitAmount: import("@prisma/client/runtime/library").Decimal;
        period: string;
        alertEnabled: boolean;
        alertThreshold: import("@prisma/client/runtime/library").Decimal;
    }>;
    checkLimit(workspaceId: string, categoryId: string, amount: number): Promise<{
        hasLimit: boolean;
        limit?: undefined;
        spent?: undefined;
        newTotal?: undefined;
        percentage?: undefined;
        exceeded?: undefined;
        nearLimit?: undefined;
        category?: undefined;
        alertThreshold?: undefined;
    } | {
        hasLimit: boolean;
        limit: number;
        spent: number;
        newTotal: number;
        percentage: number;
        exceeded: boolean;
        nearLimit: boolean;
        category: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            type: import(".prisma/client").$Enums.CategoryType;
            workspaceId: string;
            icon: string;
            color: string;
            description: string | null;
            isFavorite: boolean;
            sortOrder: number;
        };
        alertThreshold: number;
    }>;
    getCategorySpending(workspaceId: string, categoryId: string, period?: 'monthly' | 'yearly'): Promise<{
        spent: number;
        count: number;
    }>;
}
