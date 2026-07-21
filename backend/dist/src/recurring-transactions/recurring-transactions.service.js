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
var RecurringTransactionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecurringTransactionsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
const notifications_service_1 = require("../notifications/notifications.service");
let RecurringTransactionsService = RecurringTransactionsService_1 = class RecurringTransactionsService {
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(RecurringTransactionsService_1.name);
    }
    async handleCron() {
        this.logger.log('Ejecutando generación automática de transacciones recurrentes...');
        const count = await this.generateDueTransactions();
        this.logger.log(`Transacciones recurrentes generadas: ${count}`);
    }
    async findAll(workspaceId) {
        return this.prisma.recurringTransaction.findMany({
            where: { workspaceId, deletedAt: null, isActive: true },
            include: { category: true, transactions: true },
            orderBy: { nextDueDate: 'asc' },
        });
    }
    async findOne(id, workspaceId) {
        return this.prisma.recurringTransaction.findFirst({
            where: { id, workspaceId, deletedAt: null },
            include: { category: true, transactions: true },
        });
    }
    async create(workspaceId, data) {
        const nextDueDate = this.calculateNextDueDate(data.frequency, data.dayOfMonth, data.dayOfWeek, new Date(data.startDate));
        return this.prisma.recurringTransaction.create({
            data: {
                workspaceId,
                ...data,
                nextDueDate,
                currency: data.currency || client_1.Currency.ARS,
            },
            include: { category: true },
        });
    }
    async update(id, workspaceId, data) {
        const existing = await this.prisma.recurringTransaction.findFirst({
            where: { id, workspaceId, deletedAt: null },
        });
        if (!existing)
            throw new Error('Movimiento recurrente no encontrado');
        const updateData = { ...data };
        if (data.frequency || data.dayOfMonth !== undefined || data.dayOfWeek !== undefined || data.startDate) {
            const frequency = data.frequency || existing.frequency;
            const dayOfMonth = data.dayOfMonth ?? existing.dayOfMonth;
            const dayOfWeek = data.dayOfWeek ?? existing.dayOfWeek;
            const startDate = data.startDate ? new Date(data.startDate) : existing.startDate;
            updateData.nextDueDate = this.calculateNextDueDate(frequency, dayOfMonth, dayOfWeek, startDate);
        }
        return this.prisma.recurringTransaction.update({
            where: { id },
            data: updateData,
            include: { category: true },
        });
    }
    async delete(id, workspaceId) {
        return this.prisma.recurringTransaction.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
    }
    async generateDueTransactions() {
        const now = new Date();
        const dueTransactions = await this.prisma.recurringTransaction.findMany({
            where: {
                isActive: true,
                deletedAt: null,
                nextDueDate: { lte: now },
                OR: [{ endDate: null }, { endDate: { gte: now } }],
            },
            include: { category: true, workspace: { include: { user: true } } },
        });
        this.logger.log(`Generando ${dueTransactions.length} transacciones recurrentes`);
        for (const rt of dueTransactions) {
            try {
                const transaction = await this.prisma.transaction.create({
                    data: {
                        workspaceId: rt.workspaceId,
                        categoryId: rt.categoryId,
                        type: rt.type,
                        amount: rt.amount,
                        currency: rt.currency,
                        description: rt.description || rt.name,
                        date: new Date(),
                        paymentMethod: 'CASH',
                        status: 'CONFIRMED',
                        source: 'api',
                        recurringTransactionId: rt.id,
                    },
                });
                const nextDueDate = this.calculateNextDueDate(rt.frequency, rt.dayOfMonth, rt.dayOfWeek, rt.nextDueDate);
                await this.prisma.recurringTransaction.update({
                    where: { id: rt.id },
                    data: {
                        lastGeneratedAt: new Date(),
                        nextDueDate,
                    },
                });
                await this.notificationsService.createRecurringReminder(rt.workspace.user.id, rt.name, Number(rt.amount));
                this.logger.log(`Transacción generada: ${rt.name} - ${rt.amount}`);
            }
            catch (error) {
                this.logger.error(`Error generando transacción recurrente ${rt.id}:`, error);
            }
        }
        return dueTransactions.length;
    }
    calculateNextDueDate(frequency, dayOfMonth, dayOfWeek, fromDate) {
        const next = new Date(fromDate);
        switch (frequency) {
            case 'DAILY':
                next.setDate(next.getDate() + 1);
                break;
            case 'WEEKLY':
                next.setDate(next.getDate() + 7);
                break;
            case 'MONTHLY':
                next.setMonth(next.getMonth() + 1);
                if (dayOfMonth) {
                    const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
                    next.setDate(Math.min(dayOfMonth, lastDay));
                }
                break;
            case 'YEARLY':
                next.setFullYear(next.getFullYear() + 1);
                break;
        }
        return next;
    }
};
exports.RecurringTransactionsService = RecurringTransactionsService;
__decorate([
    (0, schedule_1.Cron)('0 * * * *', {
        name: 'generate-recurring-transactions',
        timeZone: 'America/Argentina/Buenos_Aires',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecurringTransactionsService.prototype, "handleCron", null);
exports.RecurringTransactionsService = RecurringTransactionsService = RecurringTransactionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], RecurringTransactionsService);
//# sourceMappingURL=recurring-transactions.service.js.map