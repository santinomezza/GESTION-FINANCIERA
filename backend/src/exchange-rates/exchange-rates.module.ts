import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { ExchangeRatesService } from './exchange-rates.service';
import { ExchangeRatesController } from './exchange-rates.controller';

@Module({
    imports: [PrismaModule],
    controllers: [ExchangeRatesController],
    providers: [ExchangeRatesService],
    exports: [ExchangeRatesService],
})
export class ExchangeRatesModule { }