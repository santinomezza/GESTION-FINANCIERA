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
var CategoryLimitsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryLimitsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let CategoryLimitsService = CategoryLimitsService_1 = class CategoryLimitsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CategoryLimitsService_1.name);
    }
    async findAll(workspaceId) {
        return this.prisma.categoryLimit.findMany({
            where: { workspaceId, deletedAt: null, isActive: true },
            include: { category: true },
            orderBy: { category: { name: 'asc' } },
        });
    }
    async findOne(id, workspaceId) {
        return this.prisma.categoryLimit.findFirst({
            where: { id, workspaceId, deletedAt: null },
            include: { category: true },
        });
    }
    async create(workspaceId, data) {
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
    async update(id, workspaceId, data) {
        const existing = await this.prisma.categoryLimit.findFirst({
            where: { id, workspaceId, deletedAt: null },
        });
        if (!existing)
            throw new Error('Límite de categoría no encontrado');
        return this.prisma.categoryLimit.update({
            where: { id },
            data,
            include: { category: true },
        });
    }
    async delete(id, workspaceId) {
        return this.prisma.categoryLimit.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
    }
    async checkLimit(workspaceId, categoryId, amount) {
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
        if (!limit)
            return { hasLimit: false };
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
    async getCategorySpending(workspaceId, categoryId, period = 'monthly') {
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
};
exports.CategoryLimitsService = CategoryLimitsService;
exports.CategoryLimitsService = CategoryLimitsService = CategoryLimitsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoryLimitsService);
//# sourceMappingURL=category-limits.service.js.map