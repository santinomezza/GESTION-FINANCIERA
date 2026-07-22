import { UploadedFile } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './create-invoice.dto';
import { UpdateInvoiceDto } from './update-invoice.dto';
import { MarkInvoicePaidDto } from './mark-invoice-paid.dto';
import { ClientsService } from './clients/clients.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
interface UploadedFile {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
}
export declare class InvoicesController {
    private readonly invoicesService;
    private readonly clientsService;
    private config;
    constructor(invoicesService: InvoicesService, clientsService: ClientsService, config: ConfigService);
    create(workspaceId: string, createInvoiceDto: CreateInvoiceDto): Promise<{
        id: string;
        invoiceNumber: string;
        issueDate: Date;
        dueDate: Date;
        totalAmount: number;
        status: string;
        urlArchivo: string | null;
        file: Buffer | null;
        fileMimeType: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        workspaceId: string;
        clientId: string | null;
    }>;
    findAll(workspaceId: string, clientId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        client: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            workspaceId: string;
            name: string;
            cuit: string | null;
            email: string | null;
            phone: string | null;
            address: string | null;
        };
    } & {
        id: string;
        invoiceNumber: string;
        issueDate: Date;
        dueDate: Date;
        totalAmount: number;
        status: string;
        urlArchivo: string | null;
        file: Buffer | null;
        fileMimeType: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        workspaceId: string;
        clientId: string | null;
    })[]>;
    findOne(workspaceId: string, id: string): Promise<{
        client: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            workspaceId: string;
            name: string;
            cuit: string | null;
            email: string | null;
            phone: string | null;
            address: string | null;
        };
        transactions: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            workspaceId: string;
            categoryId: string | null;
            type: import(".prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: import(".prisma/client").$Enums.Currency;
            description: string | null;
            notes: string | null;
            date: Date;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            source: string;
            telegramMsgId: string | null;
            invoiceId: string | null;
            goalId: string | null;
            recurringTransactionId: string | null;
            createdById: string | null;
        }[];
    } & {
        id: string;
        invoiceNumber: string;
        issueDate: Date;
        dueDate: Date;
        totalAmount: number;
        status: string;
        urlArchivo: string | null;
        file: Buffer | null;
        fileMimeType: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        workspaceId: string;
        clientId: string | null;
    }>;
    getInvoiceFile(workspaceId: string, id: string, res: Response): Promise<void>;
    update(workspaceId: string, id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<{
        id: string;
        invoiceNumber: string;
        issueDate: Date;
        dueDate: Date;
        totalAmount: number;
        status: string;
        urlArchivo: string | null;
        file: Buffer | null;
        fileMimeType: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        workspaceId: string;
        clientId: string | null;
    }>;
    remove(workspaceId: string, id: string): Promise<{
        id: string;
        invoiceNumber: string;
        issueDate: Date;
        dueDate: Date;
        totalAmount: number;
        status: string;
        urlArchivo: string | null;
        file: Buffer | null;
        fileMimeType: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        workspaceId: string;
        clientId: string | null;
    }>;
    markAsPaid(workspaceId: string, id: string, markAsPaidDto: MarkInvoicePaidDto): Promise<{
        id: string;
        invoiceNumber: string;
        issueDate: Date;
        dueDate: Date;
        totalAmount: number;
        status: string;
        urlArchivo: string | null;
        file: Buffer | null;
        fileMimeType: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        workspaceId: string;
        clientId: string | null;
    }>;
    uploadInvoice(workspaceId: string, file: UploadedFile): Promise<{
        invoice: {
            id: string;
            invoiceNumber: string;
            issueDate: Date;
            dueDate: Date;
            totalAmount: number;
            status: string;
            urlArchivo: string | null;
            file: Buffer | null;
            fileMimeType: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            workspaceId: string;
            clientId: string | null;
        };
        extracted: import("./ai/ai.service").ExtractedInvoice;
        fileUrl: string;
    }>;
    uploadInvoiceFile(workspaceId: string, id: string, file: UploadedFile): Promise<{
        fileUrl: string;
    }>;
}
export {};
