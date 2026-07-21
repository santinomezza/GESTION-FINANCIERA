import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TelegramService } from './telegram.service';

@Injectable()
export class TelegramMonthlySummaryService {
    private readonly logger = new Logger(TelegramMonthlySummaryService.name);

    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService,
        private telegramService: TelegramService,
    ) { }

    @Cron('0 9 1 * *', {
        name: 'monthly-summary-job',
        timeZone: 'America/Argentina/Buenos_Aires',
    })
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

        const results = await Promise.allSettled(
            users.map(async (user) => {
                if (!user.telegramId) return 0;
                const userWorkspaces = allWorkspaces.filter(ws => ws.userId === user.id);
                const summaries = await Promise.allSettled(
                    userWorkspaces.map(async (workspace) => {
                        const summary = await this.generateMonthlySummary(workspace.id);
                        await this.notificationsService.createMonthlySummary(user.id, workspace.id, summary);
                        const modeLabel = workspace.type === 'BUSINESS' ? '🏢 Empresarial' : '👤 Personal';
                        const message = this.buildMonthlySummaryMessage(workspace.name, modeLabel, summary);
                        await this.telegramService.sendMessage(user.telegramId, message);
                        this.logger.log(`Resumen enviado a ${user.name} - ${workspace.name}`);
                        return 1;
                    })
                );
                return summaries.filter(r => r.status === 'fulfilled').length;
            })
        );

        const sentCount = results
            .filter(r => r.status === 'fulfilled')
            .reduce((sum, r) => sum + (r.value as number), 0);

        this.logger.log(`Resúmenes mensuales enviados: ${sentCount}`);
        return { success: true, sentCount };
    }

    private buildMonthlySummaryMessage(workspaceName: string, modeLabel: string, summary: any): string {
        const escape = (t: string) => t.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
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

    private async generateMonthlySummary(workspaceId: string) {
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
                  const map = new Map<string, string>();
                  cats.forEach(c => map.set(c.id, c.name));
                  return map;
              })
            : new Map<string, string>();

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
}