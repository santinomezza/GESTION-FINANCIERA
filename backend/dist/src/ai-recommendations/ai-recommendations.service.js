"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AIRecommendationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIRecommendationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let AIRecommendationsService = AIRecommendationsService_1 = class AIRecommendationsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AIRecommendationsService_1.name);
    }
    async findAll(userId, workspaceId) {
        const where = { userId, isDismissed: false };
        if (workspaceId)
            where.workspaceId = workspaceId;
        return this.prisma.aIRecommendation.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
    }
    async findOne(id, userId) {
        return this.prisma.aIRecommendation.findFirst({
            where: { id, userId },
        });
    }
    async create(userId, workspaceId, data) {
        return this.prisma.aIRecommendation.create({
            data: {
                userId,
                workspaceId,
                ...data,
                priority: data.priority || 'medium',
            },
        });
    }
    async markAsRead(id, userId) {
        return this.prisma.aIRecommendation.updateMany({
            where: { id, userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
    }
    async dismiss(id, userId) {
        return this.prisma.aIRecommendation.updateMany({
            where: { id, userId },
            data: { isDismissed: true },
        });
    }
    async generateRecommendations(userId, workspaceId) {
        const recommendations = [];
        const transactions = await this.prisma.transaction.findMany({
            where: { workspaceId, deletedAt: null, status: 'CONFIRMED' },
            include: { category: true },
            orderBy: { date: 'desc' },
            take: 100,
        });
        const expenses = transactions.filter(t => t.type === 'EXPENSE');
        const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
        const categorySpending = {};
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
    async getPendingRecommendations(userId, workspaceId) {
        return this.findAll(userId, workspaceId).then(recs => recs.filter(r => !r.isRead && !r.isDismissed));
    }
};
exports.AIRecommendationsService = AIRecommendationsService;
exports.AIRecommendationsService = AIRecommendationsService = AIRecommendationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AIRecommendationsService);
//# sourceMappingURL=ai-recommendations.service.js.map