import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { TelegramModule } from './telegram/telegram.module';
import { AiModule } from './ai/ai.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import appConfig from './config/app.config';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ClientsModule } from './clients/clients.module';
import { InvoicesModule } from './invoices.module';
import { SplitModule } from './split.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WorkspacesModule } from './common/guards/workspaces.module';
import { GoalsModule } from './goals/goals.module';
import { InvoicesArModule } from './invoices-ar/invoices-ar.module';
import { RecurringTransactionsModule } from './recurring-transactions/recurring-transactions.module';
import { CategoryLimitsModule } from './category-limits/category-limits.module';
import { ExchangeRatesModule } from './exchange-rates/exchange-rates.module';
import { WorkspaceMembersModule } from './workspace-members/workspace-members.module';
import { InvitationsModule } from './invitations/invitations.module';
import { AIRecommendationsModule } from './ai-recommendations/ai-recommendations.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    ThrottlerModule.forRoot([{ ttl: 60, limit: 20 }]),
    ScheduleModule.forRoot(),
    CommonModule,
    AuthModule,
    UsersModule,
    TelegramModule,
    AiModule,
    CategoriesModule,
    TransactionsModule,
    DashboardModule,
    ClientsModule,
    InvoicesModule,
    SplitModule,
    NotificationsModule,
    WorkspacesModule,
    GoalsModule,
    InvoicesArModule,
    RecurringTransactionsModule,
    CategoryLimitsModule,
    ExchangeRatesModule,
    WorkspaceMembersModule,
    InvitationsModule,
    AIRecommendationsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule { }