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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async findAll(userId) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
    async markRead(userId, id) {
        return this.prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true, readAt: new Date() },
        });
    }
    async markAllRead(userId) {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
    }
    async delete(userId, id) {
        return this.prisma.notification.deleteMany({ where: { id, userId } });
    }
    async getUnreadCount(userId) {
        return this.prisma.notification.count({ where: { userId, isRead: false } });
    }
    async create(userId, data) {
        return this.prisma.notification.create({
            data: { userId, ...data, data: data.data || {} },
        });
    }
    async createMonthlySummary(userId, workspaceId, summaryData) {
        return this.create(userId, {
            type: 'MONTHLY_SUMMARY',
            title: 'Resumen mensual disponible',
            message: 'Tu resumen financiero del mes está listo para ser consultado.',
            data: { workspaceId, summary: summaryData },
        });
    }
    async createCategoryLimitAlert(userId, categoryName, percentage, spent, limit) {
        return this.create(userId, {
            type: 'CATEGORY_LIMIT_ALERT',
            title: '⚠️ Alerta de límite de categoría',
            message: `Has gastado el ${percentage.toFixed(1)}% de tu límite en ${categoryName}`,
            data: { categoryName, percentage, spent, limit },
        });
    }
    async createRecurringReminder(userId, transactionName, amount) {
        return this.create(userId, {
            type: 'RECURRING_REMINDER',
            title: '📅 Movimiento recurrente generado',
            message: `Se ha generado automáticamente: ${transactionName} por $${amount}`,
            data: { transactionName, amount },
        });
    }
    async createAIRecommendation(userId, title, message, priority = 'medium', data) {
        return this.create(userId, {
            type: 'AI_INSIGHT',
            title,
            message,
            data: { ...data, priority },
        });
    }
    async getUnreadNotifications(userId) {
        return this.prisma.notification.findMany({
            where: { userId, isRead: false },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map