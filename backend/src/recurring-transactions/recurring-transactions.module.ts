import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RecurringTransactionsService } from './recurring-transactions.service';
import { RecurringTransactionsController } from './recurring-transactions.controller';

@Module({
    imports: [PrismaModule, NotificationsModule],
    controllers: [RecurringTransactionsController],
    providers: [RecurringTransactionsService],
    exports: [RecurringTransactionsService],
})
export class RecurringTransactionsModule { }