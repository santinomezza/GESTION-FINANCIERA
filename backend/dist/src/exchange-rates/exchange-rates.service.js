"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ExchangeRatesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeRatesService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let ExchangeRatesService = ExchangeRatesService_1 = class ExchangeRatesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ExchangeRatesService_1.name);
    }
    async handleCron() {
        this.logger.log('Actualizando tasas de cambio diarias...');
        await this.updateFromAPI();
    }
    async findAll(fromCurrency, toCurrency, startDate, endDate) {
        const where = {};
        if (fromCurrency)
            where.fromCurrency = fromCurrency;
        if (toCurrency)
            where.toCurrency = toCurrency;
        if (startDate || endDate) {
            where.date = {};
            if (startDate)
                where.date.gte = startDate;
            if (endDate)
                where.date.lte = endDate;
        }
        return this.prisma.exchangeRate.findMany({
            where,
            orderBy: { date: 'desc' },
            take: 100,
        });
    }
    async findOne(fromCurrency, toCurrency, date) {
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
    async getRate(fromCurrency, toCurrency, date = new Date()) {
        if (fromCurrency === toCurrency) {
            return { rate: 1, date: new Date(), source: 'same_currency' };
        }
        const rate = await this.findOne(fromCurrency, toCurrency, date);
        if (rate) {
            return { rate: Number(rate.rate), date: rate.date, source: rate.source };
        }
        const defaultRates = {
            USD: { ARS: 850, EUR: 0.92, BRL: 5.1 },
            ARS: { USD: 0.00118, EUR: 0.00108, BRL: 0.006 },
            EUR: { USD: 1.09, ARS: 925, BRL: 5.55 },
        };
        const fallbackRate = defaultRates[fromCurrency]?.[toCurrency] || 1;
        this.logger.warn(`Tasa de cambio no encontrada para ${fromCurrency}->${toCurrency}, usando valor por defecto: ${fallbackRate}`);
        return { rate: fallbackRate, date: new Date(), source: 'fallback' };
    }
    async createOrUpdate(fromCurrency, toCurrency, rate, date, source = 'manual') {
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
    async convertAmount(amount, fromCurrency, toCurrency, date = new Date()) {
        if (fromCurrency === toCurrency)
            return amount;
        const { rate } = await this.getRate(fromCurrency, toCurrency, date);
        return amount * rate;
    }
    async updateFromAPI() {
        this.logger.log('Actualizando tasas de cambio desde API externa...');
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let usdToArs = 0;
            try {
                const response = await fetch('https://dolarapi.com/v1/dolares/oficial');
                const data = await response.json();
                if (data && data.venta) {
                    usdToArs = data.venta;
                    this.logger.log(`Tasa USD -> ARS obtenida de Dolar API (Oficial): ${usdToArs}`);
                }
            }
            catch (err) {
                this.logger.error('Error al obtener USD -> ARS de Dolar API, usando fallback:', err.message);
            }
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            const arsRate = usdToArs || data.rates.ARS || 850;
            const eurRate = data.rates.EUR || 0.92;
            const brlRate = data.rates.BRL || 5.1;
            const ratesToUpdate = [
                { from: client_1.Currency.USD, to: client_1.Currency.ARS, rate: arsRate },
                { from: client_1.Currency.USD, to: client_1.Currency.EUR, rate: eurRate },
                { from: client_1.Currency.USD, to: client_1.Currency.BRL, rate: brlRate },
                { from: client_1.Currency.ARS, to: client_1.Currency.USD, rate: 1 / arsRate },
                { from: client_1.Currency.EUR, to: client_1.Currency.USD, rate: 1 / eurRate },
                { from: client_1.Currency.BRL, to: client_1.Currency.USD, rate: 1 / brlRate },
            ];
            for (const { from, to, rate } of ratesToUpdate) {
                await this.createOrUpdate(from, to, rate, today, 'api');
            }
            this.logger.log('Tasas de cambio actualizadas exitosamente');
            return { success: true, message: 'Tasas de cambio actualizadas exitosamente' };
        }
        catch (error) {
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
};
exports.ExchangeRatesService = ExchangeRatesService;
__decorate([
    (0, schedule_1.Cron)('0 0 * * *', {
        name: 'daily-exchange-rate-update',
        timeZone: 'America/Argentina/Buenos_Aires',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ExchangeRatesService.prototype, "handleCron", null);
exports.ExchangeRatesService = ExchangeRatesService = ExchangeRatesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExchangeRatesService);
//# sourceMappingURL=exchange-rates.service.js.map