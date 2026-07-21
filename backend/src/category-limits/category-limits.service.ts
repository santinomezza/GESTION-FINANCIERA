import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class CategoryLimitsService {
    private readonly logger = new Logger(CategoryLimitsService.name);

    constructor(private prisma: PrismaService) { }

    async findAll(workspaceId: string) {
        return this.prisma.categoryLimit.findMany({
            where: { workspaceId, deletedAt: null, isActive: true },
            include: { category: true },
            orderBy: { category: { name: 'asc' } },
        });
    }

    async findOne(id: string, workspaceId: string) {
        return this.prisma.categoryLimit.findFirst({
            where: { id, workspaceId, deletedAt: null },
            include: { category: true },
        });
    }

    async create(workspaceId: string, data: {
        categoryId: string;
        limitAmount: number;
        period?: string;
        alertEnabled?: boolean;
        alertThreshold?: number;
    }) {
        return this.prisma.categoryLimit.create({
            data: {
                workspaceId,
                ...data,
                period: data.period || 'monthly',
                alertEnabled: data.alertEnabled ?? true,
                alertThreshold: data.alertThreshold || 80,
            },
            include: { category: true },
        });
    }

    async update(id: string, workspaceId: string, data: {
        limitAmount?: number;
        period?: string;
        alertEnabled?: boolean;
        alertThreshold?: number;
        isActive?: boolean;
    }) {
        const existing = await this.prisma.categoryLimit.findFirst({
            where: { id, workspaceId, deletedAt: null },
        });
        if (!existing) throw new Error('Límite de categoría no encontrado');

        return this.prisma.categoryLimit.update({
            where: { id },
            data,
            include: { category: true },
        });
    }

    async delete(id: string, workspaceId: string) {
        return this.prisma.categoryLimit.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
    }

    async checkLimit(workspaceId: string, categoryId: string, amount: number) {
        const limit = await this.prisma.categoryLimit.findFirst({
            where: {
                workspaceId,
                categoryId,
                deletedAt: null,
                isActive: true,
                alertEnabled: true,
            },
            include: { category: true },
        });

        if (!limit) return { hasLimit: false };

        const now = new Date();
        const startOfPeriod = limit.period === 'yearly'
            ? new Date(now.getFullYear(), 0, 1)
            : new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfPeriod = limit.period === 'yearly'
            ? new Date(now.getFullYear(), 11, 31)
            : new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const currentSpent = await this.prisma.transaction.aggregate({
            where: {
                workspaceId,
                categoryId,
                type: 'EXPENSE',
                date: { gte: startOfPeriod, lte: endOfPeriod },
                status: 'CONFIRMED',
                deletedAt: null,
            },
            _sum: { amount: true },
        });

        const spent = Number(currentSpent._sum.amount || 0);
        const newTotal = spent + amount;
        const percentage = (newTotal / Number(limit.limitAmount)) * 100;
        const exceeded = newTotal > Number(limit.limitAmount);
        const nearLimit = percentage >= Number(limit.alertThreshold) && !exceeded;

        return {
            hasLimit: true,
            limit: Number(limit.limitAmount),
            spent,
            newTotal,
            percentage,
            exceeded,
            nearLimit,
            category: limit.category,
            alertThreshold: Number(limit.alertThreshold),
        };
    }

    async getCategorySpending(workspaceId: string, categoryId: string, period: 'monthly' | 'yearly' = 'monthly') {
        const now = new Date();
        const startOfPeriod = period === 'yearly'
            ? new Date(now.getFullYear(), 0, 1)
            : new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfPeriod = period === 'yearly'
            ? new Date(now.getFullYear(), 11, 31)
            : new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const result = await this.prisma.transaction.aggregate({
            where: {
                workspaceId,
                categoryId,
                type: 'EXPENSE',
                date: { gte: startOfPeriod, lte: endOfPeriod },
                status: 'CONFIRMED',
                deletedAt: null,
            },
            _sum: { amount: true },
            _count: true,
        });

        return {
            spent: Number(result._sum.amount || 0),
            count: result._count,
        };
    }
}