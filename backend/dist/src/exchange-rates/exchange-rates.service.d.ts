import { PrismaService } from '../common/prisma/prisma.service';
import { Currency } from '@prisma/client';
export declare class ExchangeRatesService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleCron(): Promise<void>;
    findAll(fromCurrency?: Currency, toCurrency?: Currency, startDate?: Date, endDate?: Date): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        source: string;
        fromCurrency: import(".prisma/client").$Enums.Currency;
        toCurrency: import(".prisma/client").$Enums.Currency;
        rate: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    findOne(fromCurrency: Currency, toCurrency: Currency, date: Date): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        source: string;
        fromCurrency: import(".prisma/client").$Enums.Currency;
        toCurrency: import(".prisma/client").$Enums.Currency;
        rate: import("@prisma/client/runtime/library").Decimal;
    }>;
    getRate(fromCurrency: Currency, toCurrency: Currency, date?: Date): Promise<{
        rate: number;
        date: Date;
        source: string;
    }>;
    createOrUpdate(fromCurrency: Currency, toCurrency: Currency, rate: number, date: Date, source?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        source: string;
        fromCurrency: import(".prisma/client").$Enums.Currency;
        toCurrency: import(".prisma/client").$Enums.Currency;
        rate: import("@prisma/client/runtime/library").Decimal;
    }>;
    convertAmount(amount: number, fromCurrency: Currency, toCurrency: Currency, date?: Date): Promise<number>;
    updateFromAPI(): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    getLatestRates(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        source: string;
        fromCurrency: import(".prisma/client").$Enums.Currency;
        toCurrency: import(".prisma/client").$Enums.Currency;
        rate: import("@prisma/client/runtime/library").Decimal;
    }[]>;
}
