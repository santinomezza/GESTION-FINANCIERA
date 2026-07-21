import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { PrismaModule } from './common/prisma/prisma.module';
import { AiModule } from './ai/ai.module';
import { ClientsModule } from './clients/clients.module';

@Module({
    imports: [PrismaModule, AiModule, ClientsModule],
    controllers: [InvoicesController],
    providers: [InvoicesService],
    exports: [InvoicesService],
})
export class InvoicesModule { }
