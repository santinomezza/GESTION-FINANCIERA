import { ExchangeRatesService } from './exchange-rates.service';
export declare class ExchangeRatesController {
    private readonly service;
    constructor(service: ExchangeRatesService);
    findAll(req: any, req2: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        source: string;
        fromCurrency: import(".prisma/client").$Enums.Currency;
        toCurrency: import(".prisma/client").$Enums.Currency;
        rate: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    getLatest(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        source: string;
        fromCurrency: import(".prisma/client").$Enums.Currency;
        toCurrency: import(".prisma/client").$Enums.Currency;
        rate: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    convert(req: any, data: {
        amount: number;
        fromCurrency: string;
        toCurrency: string;
    }): Promise<number>;
    updateFromAPI(req: any): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
}
