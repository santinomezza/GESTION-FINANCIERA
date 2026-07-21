import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TelegramService } from './telegram.service';
export declare class TelegramMonthlySummaryService {
    private prisma;
    private notificationsService;
    private telegramService;
    private readonly logger;
    constructor(prisma: PrismaService, notificationsService: NotificationsService, telegramService: TelegramService);
    sendMonthlySummaries(): Promise<{
        success: boolean;
        sentCount: number;
    }>;
    private buildMonthlySummaryMessage;
    private generateMonthlySummary;
}
