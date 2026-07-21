import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';
import { RecurrenceFrequency, TransactionType, Currency } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class RecurringTransactionsService {
    private readonly logger = new Logger(RecurringTransactionsService.name);

    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService,
    ) { }

    @Cron('0 * * * *', {
        name: 'generate-recurring-transactions',
        timeZone: 'America/Argentina/Buenos_Aires',
    })
    async handleCron() {
        this.logger.log('Ejecutando generación automática de transacciones recurrentes...');
        const count = await this.generateDueTransactions();
        this.logger.log(`Transacciones recurrentes generadas: ${count}`);
    }

    async findAll(workspaceId: string) {
        return this.prisma.recurringTransaction.findMany({
            where: { workspaceId, deletedAt: null, isActive: true },
            include: { category: true, transactions: true },
            orderBy: { nextDueDate: 'asc' },
        });
    }

    async findOne(id: string, workspaceId: string) {
        return this.prisma.recurringTransaction.findFirst({
            where: { id, workspaceId, deletedAt: null },
            include: { category: true, transactions: true },
        });
    }

    async create(workspaceId: string, data: {
        name: string;
        description?: string;
        type: TransactionType;
        amount: number;
        currency?: Currency;
        categoryId?: string;
        frequency: RecurrenceFrequency;
        dayOfMonth?: number;
        dayOfWeek?: number;
        startDate: Date;
        endDate?: Date;
    }) {
        const nextDueDate = this.calculateNextDueDate(
            data.frequency,
            data.dayOfMonth,
            data.dayOfWeek,
            new Date(data.startDate),
        );

        return this.prisma.recurringTransaction.create({
            data: {
                workspaceId,
                ...data,
                nextDueDate,
                currency: data.currency || Currency.ARS,
            },
            include: { category: true },
        });
    }

    async update(id: string, workspaceId: string, data: any) {
        const existing = await this.prisma.recurringTransaction.findFirst({
            where: { id, workspaceId, deletedAt: null },
        });
        if (!existing) throw new Error('Movimiento recurrente no encontrado');

        const updateData: any = { ...data };
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

    async delete(id: string, workspaceId: string) {
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

                const nextDueDate = this.calculateNextDueDate(
                    rt.frequency,
                    rt.dayOfMonth,
                    rt.dayOfWeek,
                    rt.nextDueDate,
                );

                await this.prisma.recurringTransaction.update({
                    where: { id: rt.id },
                    data: {
                        lastGeneratedAt: new Date(),
                        nextDueDate,
                    },
                });

                await this.notificationsService.createRecurringReminder(
                    rt.workspace.user.id,
                    rt.name,
                    Number(rt.amount)
                );

                this.logger.log(`Transacción generada: ${rt.name} - ${rt.amount}`);
            } catch (error) {
                this.logger.error(`Error generando transacción recurrente ${rt.id}:`, error);
            }
        }

        return dueTransactions.length;
    }

    private calculateNextDueDate(
        frequency: RecurrenceFrequency,
        dayOfMonth: number | null,
        dayOfWeek: number | null,
        fromDate: Date,
    ): Date {
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
}