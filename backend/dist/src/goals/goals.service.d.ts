import { PrismaService } from '../common/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
export interface GoalStats {
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    totalTarget: string;
    totalSaved: string;
    completionRate: string;
}
export declare class GoalsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(workspaceId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        category: string | null;
        workspaceId: string;
        description: string | null;
        targetAmount: Decimal;
        currentAmount: Decimal;
        targetDate: Date | null;
        isCompleted: boolean;
    }[]>;
    findOne(workspaceId: string, id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        category: string | null;
        workspaceId: string;
        description: string | null;
        targetAmount: Decimal;
        currentAmount: Decimal;
        targetDate: Date | null;
        isCompleted: boolean;
    }>;
    create(workspaceId: string, dto: any): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        category: string | null;
        workspaceId: string;
        description: string | null;
        targetAmount: Decimal;
        currentAmount: Decimal;
        targetDate: Date | null;
        isCompleted: boolean;
    }>;
    update(workspaceId: string, id: string, dto: any): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        category: string | null;
        workspaceId: string;
        description: string | null;
        targetAmount: Decimal;
        currentAmount: Decimal;
        targetDate: Date | null;
        isCompleted: boolean;
    }>;
    remove(workspaceId: string, id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        category: string | null;
        workspaceId: string;
        description: string | null;
        targetAmount: Decimal;
        currentAmount: Decimal;
        targetDate: Date | null;
        isCompleted: boolean;
    }>;
    addToGoal(workspaceId: string, id: string, amount: number): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        category: string | null;
        workspaceId: string;
        description: string | null;
        targetAmount: Decimal;
        currentAmount: Decimal;
        targetDate: Date | null;
        isCompleted: boolean;
    }>;
    getStats(workspaceId: string): Promise<GoalStats>;
}
