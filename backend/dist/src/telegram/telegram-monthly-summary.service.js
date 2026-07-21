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
var TelegramMonthlySummaryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramMonthlySummaryService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../common/prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const telegram_service_1 = require("./telegram.service");
let TelegramMonthlySummaryService = TelegramMonthlySummaryService_1 = class TelegramMonthlySummaryService {
    constructor(prisma, notificationsService, telegramService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.telegramService = telegramService;
        this.logger = new common_1.Logger(TelegramMonthlySummaryService_1.name);
    }
    async sendMonthlySummaries() {
        this.logger.log('Iniciando envío de resúmenes mensuales...');
        const users = await this.prisma.user.findMany({
            where: {
                telegramId: { not: null },
                isActive: true,
                deletedAt: null,
            },
        });
        const allWorkspaces = await this.prisma.workspace.findMany({
            where: { deletedAt: null },
            include: { user: { select: { id: true } } },
        });
        const results = await Promise.allSettled(users.map(async (user) => {
            if (!user.telegramId)
                return 0;
            const userWorkspaces = allWorkspaces.filter(ws => ws.userId === user.id);
            const summaries = await Promise.allSettled(userWorkspaces.map(async (workspace) => {
                const summary = await this.generateMonthlySummary(workspace.id);
                await this.notificationsService.createMonthlySummary(user.id, workspace.id, summary);
                const modeLabel = workspace.type === 'BUSINESS' ? '🏢 Empresarial' : '👤 Personal';
                const message = this.buildMonthlySummaryMessage(workspace.name, modeLabel, summary);
                await this.telegramService.sendMessage(user.telegramId, message);
                this.logger.log(`Resumen enviado a ${user.name} - ${workspace.name}`);
                return 1;
            }));
            return summaries.filter(r => r.status === 'fulfilled').length;
        }));
        const sentCount = results
            .filter(r => r.status === 'fulfilled')
            .reduce((sum, r) => sum + r.value, 0);
        this.logger.log(`Resúmenes mensuales enviados: ${sentCount}`);
        return { success: true, sentCount };
    }
    buildMonthlySummaryMessage(workspaceName, modeLabel, summary) {
        const escape = (t) => t.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
        const emoji = summary.balance >= 0 ? '✅' : '🔴';
        let msg = `📊 *Resumen Mensual*\n\n`;
        msg += `📂 ${escape(workspaceName)} (${modeLabel})\n\n`;
        msg += `💰 Ingresos: *${summary.totalIncome.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}*\n`;
        msg += `💸 Gastos: *${summary.totalExpense.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}*\n`;
        msg += `${emoji} Balance: *${summary.balance.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}*\n\n`;
        msg += `📝 Total movimientos: ${summary.transactionCount}\n`;
        if (summary.topCategories.length > 0) {
            msg += `\n🏷️ *Top gastos:*\n`;
            for (const cat of summary.topCategories) {
                msg += `• ${escape(cat.name)}: *${cat.amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}*\n`;
            }
        }
        return msg;
    }
    async generateMonthlySummary(workspaceId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const [income, expense, transactionCount] = await this.prisma.$transaction([
            this.prisma.transaction.aggregate({
                where: {
                    workspaceId,
                    type: 'INCOME',
                    date: { gte: startOfMonth, lte: endOfMonth },
                    status: 'CONFIRMED',
                    deletedAt: null,
                },
                _sum: { amount: true },
            }),
            this.prisma.transaction.aggregate({
                where: {
                    workspaceId,
                    type: 'EXPENSE',
                    date: { gte: startOfMonth, lte: endOfMonth },
                    status: 'CONFIRMED',
                    deletedAt: null,
                },
                _sum: { amount: true },
            }),
            this.prisma.transaction.count({
                where: {
                    workspaceId,
                    date: { gte: startOfMonth, lte: endOfMonth },
                    status: 'CONFIRMED',
                    deletedAt: null,
                },
            }),
        ]);
        const topCategoriesRaw = await this.prisma.transaction.groupBy({
            by: ['categoryId'],
            where: {
                workspaceId,
                type: 'EXPENSE',
                date: { gte: startOfMonth, lte: endOfMonth },
                status: 'CONFIRMED',
                deletedAt: null,
            },
            _sum: { amount: true },
            orderBy: { _sum: { amount: 'desc' } },
            take: 5,
        });
        const categoryIds = topCategoriesRaw.map(c => c.categoryId).filter(Boolean);
        const categoriesMap = categoryIds.length > 0
            ? await this.prisma.category.findMany({
                where: { id: { in: categoryIds } },
                select: { id: true, name: true },
            }).then(cats => {
                const map = new Map();
                cats.forEach(c => map.set(c.id, c.name));
                return map;
            })
            : new Map();
        const topCategories = topCategoriesRaw.map(cat => ({
            name: categoriesMap.get(cat.categoryId) || 'Sin categoría',
            amount: Number(cat._sum.amount || 0),
        }));
        return {
            period: `${startOfMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`,
            totalIncome: Number(income._sum.amount || 0),
            totalExpense: Number(expense._sum.amount || 0),
            balance: Number(income._sum.amount || 0) - Number(expense._sum.amount || 0),
            transactionCount,
            topCategories,
        };
    }
};
exports.TelegramMonthlySummaryService = TelegramMonthlySummaryService;
__decorate([
    (0, schedule_1.Cron)('0 9 1 * *', {
        name: 'monthly-summary-job',
        timeZone: 'America/Argentina/Buenos_Aires',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TelegramMonthlySummaryService.prototype, "sendMonthlySummaries", null);
exports.TelegramMonthlySummaryService = TelegramMonthlySummaryService = TelegramMonthlySummaryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        telegram_service_1.TelegramService])
], TelegramMonthlySummaryService);
//# sourceMappingURL=telegram-monthly-summary.service.js.map