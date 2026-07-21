import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AIRecommendationsService {
    private readonly logger = new Logger(AIRecommendationsService.name);

    constructor(private prisma: PrismaService) { }

    async findAll(userId: string, workspaceId?: string) {
        const where: any = { userId, isDismissed: false };
        if (workspaceId) where.workspaceId = workspaceId;

        return this.prisma.aIRecommendation.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
    }

    async findOne(id: string, userId: string) {
        return this.prisma.aIRecommendation.findFirst({
            where: { id, userId },
        });
    }

    async create(userId: string, workspaceId: string, data: {
        type: string;
        title: string;
        message: string;
        priority?: string;
        data?: any;
        expiresAt?: Date;
    }) {
        return this.prisma.aIRecommendation.create({
            data: {
                userId,
                workspaceId,
                ...data,
                priority: data.priority || 'medium',
            },
        });
    }

    async markAsRead(id: string, userId: string) {
        return this.prisma.aIRecommendation.updateMany({
            where: { id, userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
    }

    async dismiss(id: string, userId: string) {
        return this.prisma.aIRecommendation.updateMany({
            where: { id, userId },
            data: { isDismissed: true },
        });
    }

    async generateRecommendations(userId: string, workspaceId: string) {
        const recommendations = [];

        const transactions = await this.prisma.transaction.findMany({
            where: { workspaceId, deletedAt: null, status: 'CONFIRMED' },
            include: { category: true },
            orderBy: { date: 'desc' },
            take: 100,
        });

        const expenses = transactions.filter(t => t.type === 'EXPENSE');
        const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);

        const categorySpending: Record<string, number> = {};
        expenses.forEach(t => {
            const catName = t.category?.name || 'Sin categoría';
            categorySpending[catName] = (categorySpending[catName] || 0) + Number(t.amount);
        });

        const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0];
        if (topCategory && totalExpenses > 0) {
            const percentage = (topCategory[1] / totalExpenses) * 100;
            if (percentage > 40) {
                recommendations.push({
                    type: 'spending',
                    title: 'Concentración de gastos',
                    message: `El ${percentage.toFixed(1)}% de tus gastos están en "${topCategory[0]}". Considera diversificar tus gastos.`,
                    priority: 'medium',
                });
            }
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyTransactions = transactions.filter(t => new Date(t.date) >= startOfMonth);
        const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'EXPENSE');
        const monthlyTotal = monthlyExpenses.reduce((sum, t) => sum + Number(t.amount), 0);

        if (monthlyTotal > 0) {
            recommendations.push({
                type: 'saving',
                title: 'Oportunidad de ahorro',
                message: `Este mes llevas gastados $${monthlyTotal.toLocaleString('es-AR')}. Revisa si puedes reducir algún gasto innecesario.`,
                priority: 'low',
            });
        }

        for (const rec of recommendations) {
            await this.create(userId, workspaceId, rec);
        }

        return recommendations;
    }

    async getPendingRecommendations(userId: string, workspaceId: string) {
        return this.findAll(userId, workspaceId).then(recs =>
            recs.filter(r => !r.isRead && !r.isDismissed)
        );
    }
}