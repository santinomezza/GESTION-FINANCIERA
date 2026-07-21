import { Module } from '@nestjs/common';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';
import { TelegramMonthlySummaryService } from './telegram-monthly-summary.service';
import { AiModule } from '../ai/ai.module';
import { CategoriesModule } from '../categories/categories.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { InvoicesModule } from '../invoices.module';
import { ClientsModule } from '../clients/clients.module';
import { WorkspacesModule } from '../common/guards/workspaces.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AiModule, CategoriesModule, TransactionsModule, DashboardModule, InvoicesModule, ClientsModule, WorkspacesModule, NotificationsModule],
  controllers: [TelegramController],
  providers: [TelegramService, TelegramMonthlySummaryService],
  exports: [TelegramService, TelegramMonthlySummaryService],
})
export class TelegramModule { }
