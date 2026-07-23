import { PrismaService } from '../common/prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getTransactionsForReport(userId: string, workspaceId: string, filters: any): Promise<({
        category: {
            id: string;
            workspaceId: string;
            type: import(".prisma/client").$Enums.CategoryType;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            icon: string;
            color: string;
            isActive: boolean;
            isFavorite: boolean;
            sortOrder: number;
        };
    } & {
        id: string;
        workspaceId: string;
        categoryId: string | null;
        type: import(".prisma/client").$Enums.TransactionType;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: import(".prisma/client").$Enums.Currency;
        description: string | null;
        notes: string | null;
        date: Date;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        status: import(".prisma/client").$Enums.TransactionStatus;
        source: string;
        telegramMsgId: string | null;
        invoiceId: string | null;
        goalId: string | null;
        recurringTransactionId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        createdById: string | null;
    })[]>;
    getInvoicesForReport(userId: string, workspaceId: string, filters: any): Promise<({
        client: {
            id: string;
            workspaceId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            cuit: string | null;
            email: string | null;
            phone: string | null;
            address: string | null;
        };
    } & {
        id: string;
        workspaceId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        invoiceNumber: string;
        issueDate: Date;
        dueDate: Date;
        totalAmount: number;
        urlArchivo: string | null;
        file: Buffer | null;
        fileMimeType: string | null;
        clientId: string | null;
    })[]>;
    generateCSV(userId: string, workspaceId: string, filters: any): Promise<string>;
    generateExcel(userId: string, workspaceId: string, filters: any): Promise<Buffer>;
    generateInvoicesExcel(userId: string, workspaceId: string, filters: any): Promise<Buffer>;
    private translatePaymentMethod;
    private translateStatus;
}
