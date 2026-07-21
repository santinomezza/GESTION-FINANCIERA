import { Module } from '@nestjs/common';
import { InvoicesArController } from './invoices-ar.controller';
import { InvoicesArService } from './invoices-ar.service';
import { AiModule } from '../ai/ai.module';
import { CommonModule } from '../common/common.module';

@Module({
    imports: [CommonModule, AiModule],
    controllers: [InvoicesArController],
    providers: [InvoicesArService],
    exports: [InvoicesArService],
})
export class InvoicesArModule {}