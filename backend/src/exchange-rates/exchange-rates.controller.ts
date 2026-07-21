import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('exchange-rates')
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
export class ExchangeRatesController {
    constructor(private readonly service: ExchangeRatesService) { }

    @Get()
    findAll(@Request() req, @Request() req2) {
        return this.service.findAll();
    }

    @Get('latest')
    getLatest(@Request() req) {
        return this.service.getLatestRates();
    }

    @Post('convert')
    convert(@Request() req, @Body() data: { amount: number; fromCurrency: string; toCurrency: string }) {
        return this.service.convertAmount(data.amount, data.fromCurrency as any, data.toCurrency as any);
    }

    @Post('update')
    async updateFromAPI(@Request() req) {
        return this.service.updateFromAPI();
    }
}