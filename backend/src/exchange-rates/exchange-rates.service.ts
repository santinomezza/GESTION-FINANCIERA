import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';
import { Currency } from '@prisma/client';

@Injectable()
export class ExchangeRatesService {
    private readonly logger = new Logger(ExchangeRatesService.name);

    constructor(private prisma: PrismaService) { }

    @Cron('0 0 * * *', {
        name: 'daily-exchange-rate-update',
        timeZone: 'America/Argentina/Buenos_Aires',
    })
    async handleCron() {
        this.logger.log('Actualizando tasas de cambio diarias...');
        await this.updateFromAPI();
    }

    async findAll(fromCurrency?: Currency, toCurrency?: Currency, startDate?: Date, endDate?: Date) {
        const where: any = {};
        if (fromCurrency) where.fromCurrency = fromCurrency;
        if (toCurrency) where.toCurrency = toCurrency;
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = startDate;
            if (endDate) where.date.lte = endDate;
        }

        return this.prisma.exchangeRate.findMany({
            where,
            orderBy: { date: 'desc' },
            take: 100,
        });
    }

    async findOne(fromCurrency: Currency, toCurrency: Currency, date: Date) {
        const dateStr = new Date(date);
        dateStr.setHours(0, 0, 0, 0);

        return this.prisma.exchangeRate.findUnique({
            where: {
                fromCurrency_toCurrency_date: {
                    fromCurrency,
                    toCurrency,
                    date: dateStr,
                },
            },
        });
    }

    async getRate(fromCurrency: Currency, toCurrency: Currency, date: Date = new Date()) {
        if (fromCurrency === toCurrency) {
            return { rate: 1, date: new Date(), source: 'same_currency' };
        }

        const rate = await this.findOne(fromCurrency, toCurrency, date);
        if (rate) {
            return { rate: Number(rate.rate), date: rate.date, source: rate.source };
        }

        const defaultRates: Record<string, Record<string, number>> = {
            USD: { ARS: 850, EUR: 0.92, BRL: 5.1 },
            ARS: { USD: 0.00118, EUR: 0.00108, BRL: 0.006 },
            EUR: { USD: 1.09, ARS: 925, BRL: 5.55 },
        };

        const fallbackRate = defaultRates[fromCurrency]?.[toCurrency] || 1;
        this.logger.warn(`Tasa de cambio no encontrada para ${fromCurrency}->${toCurrency}, usando valor por defecto: ${fallbackRate}`);

        return { rate: fallbackRate, date: new Date(), source: 'fallback' };
    }

    async createOrUpdate(fromCurrency: Currency, toCurrency: Currency, rate: number, date: Date, source: string = 'manual') {
        const dateStr = new Date(date);
        dateStr.setHours(0, 0, 0, 0);

        return this.prisma.exchangeRate.upsert({
            where: {
                fromCurrency_toCurrency_date: {
                    fromCurrency,
                    toCurrency,
                    date: dateStr,
                },
            },
            create: {
                fromCurrency,
                toCurrency,
                rate,
                date: dateStr,
                source,
            },
            update: {
                rate,
                source,
                updatedAt: new Date(),
            },
        });
    }

    async convertAmount(amount: number, fromCurrency: Currency, toCurrency: Currency, date: Date = new Date()): Promise<number> {
        if (fromCurrency === toCurrency) return amount;

        const { rate } = await this.getRate(fromCurrency, toCurrency, date);
        return amount * rate;
    }

    async updateFromAPI() {
        this.logger.log('Actualizando tasas de cambio desde API externa...');

        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // 1. Fetch USD -> ARS from Dolar API (Oficial)
            let usdToArs = 0;
            try {
                const response = await fetch('https://dolarapi.com/v1/dolares/oficial');
                const data = await response.json();
                if (data && data.venta) {
                    usdToArs = data.venta;
                    this.logger.log(`Tasa USD -> ARS obtenida de Dolar API (Oficial): ${usdToArs}`);
                }
            } catch (err) {
                this.logger.error('Error al obtener USD -> ARS de Dolar API, usando fallback:', err.message);
            }

            // 2. Fetch other currencies from exchangerate-api
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();

            const arsRate = usdToArs || data.rates.ARS || 850;
            const eurRate = data.rates.EUR || 0.92;
            const brlRate = data.rates.BRL || 5.1;

            const ratesToUpdate: Array<{ from: Currency; to: Currency; rate: number }> = [
                { from: Currency.USD, to: Currency.ARS, rate: arsRate },
                { from: Currency.USD, to: Currency.EUR, rate: eurRate },
                { from: Currency.USD, to: Currency.BRL, rate: brlRate },
                // Inverse rates
                { from: Currency.ARS, to: Currency.USD, rate: 1 / arsRate },
                { from: Currency.EUR, to: Currency.USD, rate: 1 / eurRate },
                { from: Currency.BRL, to: Currency.USD, rate: 1 / brlRate },
            ];

            for (const { from, to, rate } of ratesToUpdate) {
                await this.createOrUpdate(from, to, rate, today, 'api');
            }

            this.logger.log('Tasas de cambio actualizadas exitosamente');
            return { success: true, message: 'Tasas de cambio actualizadas exitosamente' };
        } catch (error) {
            this.logger.error('Error actualizando tasas de cambio:', error);
            return { success: false, error: error.message };
        }
    }

    async getLatestRates() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const rates = await this.prisma.exchangeRate.findMany({
            where: {
                date: { gte: today },
            },
            orderBy: { date: 'desc' },
        });

        return rates;
    }
}