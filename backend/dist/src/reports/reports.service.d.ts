import { PrismaService } from '../common/prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getTransactionsForReport(userId: string, workspaceId: string, filters: any): Promise<({
        category: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            type: import(".prisma/client").$Enums.CategoryType;
            workspaceId: string;
            icon: string;
            color: string;
            description: string | null;
            isFavorite: boolean;
            sortOrder: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        type: import(".prisma/client").$Enums.TransactionType;
        workspaceId: string;
        description: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: import(".prisma/client").$Enums.Currency;
        notes: string | null;
        date: Date;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        status: import(".prisma/client").$Enums.TransactionStatus;
        source: string;
        telegramMsgId: string | null;
        categoryId: string | null;
        invoiceId: string | null;
        goalId: string | null;
        recurringTransactionId: string | null;
        createdById: string | null;
    })[]>;
    getInvoicesForReport(userId: string, workspaceId: string, filters: any): Promise<({
        client: {
            id: string;
            email: string | null;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            workspaceId: string;
            cuit: string | null;
            phone: string | null;
            address: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        workspaceId: string;
        status: string;
        invoiceNumber: string;
        issueDate: Date;
        dueDate: Date;
        totalAmount: number;
        netAmount: number | null;
        ivaPercentage: number | null;
        ivaAmount: number | null;
        clientId: string | null;
        urlArchivo: string | null;
        file: Buffer | null;
        fileMimeType: string | null;
    })[]>;
    generateCSV(userId: string, workspaceId: string, filters: any): Promise<string>;
    generateExcel(userId: string, workspaceId: string, filters: any): Promise<Buffer>;
    generateInvoicesExcel(userId: string, workspaceId: string, filters: any): Promise<Buffer>;
    private translatePaymentMethod;
    private translateStatus;
}
