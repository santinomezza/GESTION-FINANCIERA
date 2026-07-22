import { CategoryLimitsService } from './category-limits.service';
export declare class CategoryLimitsController {
    private readonly service;
    constructor(service: CategoryLimitsService);
    findAll(req: any): Promise<({
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
    findOne(id: string, req: any): Promise<{
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
    create(req: any, data: any): Promise<{
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
    update(id: string, req: any, data: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
    checkLimit(req: any, data: {
        categoryId: string;
        amount: number;
    }): Promise<{
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
}
