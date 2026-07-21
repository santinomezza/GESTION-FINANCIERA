import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) { }

  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async delete(userId: string, id: string) {
    return this.prisma.notification.deleteMany({ where: { id, userId } });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, isRead: false } });
  }

  async create(userId: string, data: {
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
  }) {
    return this.prisma.notification.create({
      data: { userId, ...data, data: data.data || {} },
    });
  }

  async createMonthlySummary(userId: string, workspaceId: string, summaryData: any) {
    return this.create(userId, {
      type: 'MONTHLY_SUMMARY',
      title: 'Resumen mensual disponible',
      message: 'Tu resumen financiero del mes está listo para ser consultado.',
      data: { workspaceId, summary: summaryData },
    });
  }

  async createCategoryLimitAlert(userId: string, categoryName: string, percentage: number, spent: number, limit: number) {
    return this.create(userId, {
      type: 'CATEGORY_LIMIT_ALERT',
      title: '⚠️ Alerta de límite de categoría',
      message: `Has gastado el ${percentage.toFixed(1)}% de tu límite en ${categoryName}`,
      data: { categoryName, percentage, spent, limit },
    });
  }

  async createRecurringReminder(userId: string, transactionName: string, amount: number) {
    return this.create(userId, {
      type: 'RECURRING_REMINDER',
      title: '📅 Movimiento recurrente generado',
      message: `Se ha generado automáticamente: ${transactionName} por $${amount}`,
      data: { transactionName, amount },
    });
  }

  async createAIRecommendation(userId: string, title: string, message: string, priority: string = 'medium', data?: any) {
    return this.create(userId, {
      type: 'AI_INSIGHT',
      title,
      message,
      data: { ...data, priority },
    });
  }

  async getUnreadNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
    });
  }
}