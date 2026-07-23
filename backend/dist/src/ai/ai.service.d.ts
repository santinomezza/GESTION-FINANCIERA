import { ConfigService } from '@nestjs/config';
export interface ExtractedInvoice {
    fecha: string | null;
    cliente: string | null;
    cuit: string | null;
    razonSocial: string | null;
    numeroTicket: string | null;
    neto: number | null;
    ivaPorcentaje: number | null;
    ivaMonto: number | null;
    total: number | null;
    confidence: number;
    rawText: string;
}
export interface ParsedTransaction {
    type: 'EXPENSE' | 'INCOME' | null;
    amount: number | null;
    category: string | null;
    description: string | null;
    date: string;
    confidence: number;
    raw: string;
}
export declare class AiService {
    private config;
    private readonly logger;
    private geminiModel;
    private openaiKey;
    private anthropicKey;
    constructor(config: ConfigService);
    extractInvoice(fileBuffer: Buffer, mimeType: string): Promise<ExtractedInvoice>;
    private convertImageToPDF;
    private extractWithAdvancedAI;
    private extractWithOpenAI;
    private extractWithAnthropic;
    private formatExtractedInvoice;
    private extractInvoiceLocally;
    private extractTextFromPDF;
    private extractTextFromImage;
    private parseInvoiceText;
    private parseAmount;
    private extractInvoiceWithGemini;
    private getCachedExtraction;
    private setCachedExtraction;
    private cleanRazonSocial;
    private parseDate;
    parseMessage(message: string, userCategories?: string[]): ParsedTransaction;
    private extractAmount;
    private detectCategory;
    getFinancialAdvice(userMessage: string, context?: {
        balance?: number;
        income?: number;
        expense?: number;
        transactionsCount?: number;
        workspaces?: any[];
        categories?: any[];
    }): Promise<string>;
    private getFallbackAdvice;
}
