import { UploadedFile } from '@nestjs/common';
import { InvoicesArService } from './invoices-ar.service';
import { CreateManualInvoiceDto } from './dto/create-manual-invoice.dto';
import { Response } from 'express';
interface UploadedFile {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
}
export declare class InvoicesArController {
    private readonly invoicesArService;
    constructor(invoicesArService: InvoicesArService);
    uploadInvoice(workspaceId: string, file: UploadedFile): Promise<{
        success: boolean;
        message: string;
        factura: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            urlArchivo: string | null;
            userId: string;
            nroFactura: string;
            tipo: string;
            fechaEmision: Date;
            fechaVencimiento: Date | null;
            subtotal: import("@prisma/client/runtime/library").Decimal | null;
            iva: import("@prisma/client/runtime/library").Decimal | null;
            importeTotal: import("@prisma/client/runtime/library").Decimal;
            condicionFiscal: string | null;
            descripcion: string | null;
            estadoPago: string;
            clienteId: string | null;
        };
        extracted: import("../ai/ai.service").ExtractedInvoice;
    }>;
    createManual(workspaceId: string, dto: CreateManualInvoiceDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        urlArchivo: string | null;
        userId: string;
        nroFactura: string;
        tipo: string;
        fechaEmision: Date;
        fechaVencimiento: Date | null;
        subtotal: import("@prisma/client/runtime/library").Decimal | null;
        iva: import("@prisma/client/runtime/library").Decimal | null;
        importeTotal: import("@prisma/client/runtime/library").Decimal;
        condicionFiscal: string | null;
        descripcion: string | null;
        estadoPago: string;
        clienteId: string | null;
    }>;
    findAll(workspaceId: string): Promise<({
        cliente: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            cuit: string;
            email: string | null;
            userId: string;
            razonSocial: string;
            telefono: string | null;
            direccion: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        urlArchivo: string | null;
        userId: string;
        nroFactura: string;
        tipo: string;
        fechaEmision: Date;
        fechaVencimiento: Date | null;
        subtotal: import("@prisma/client/runtime/library").Decimal | null;
        iva: import("@prisma/client/runtime/library").Decimal | null;
        importeTotal: import("@prisma/client/runtime/library").Decimal;
        condicionFiscal: string | null;
        descripcion: string | null;
        estadoPago: string;
        clienteId: string | null;
    })[]>;
    findOne(workspaceId: string, id: string): Promise<{
        cliente: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            cuit: string;
            email: string | null;
            userId: string;
            razonSocial: string;
            telefono: string | null;
            direccion: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        urlArchivo: string | null;
        userId: string;
        nroFactura: string;
        tipo: string;
        fechaEmision: Date;
        fechaVencimiento: Date | null;
        subtotal: import("@prisma/client/runtime/library").Decimal | null;
        iva: import("@prisma/client/runtime/library").Decimal | null;
        importeTotal: import("@prisma/client/runtime/library").Decimal;
        condicionFiscal: string | null;
        descripcion: string | null;
        estadoPago: string;
        clienteId: string | null;
    }>;
    updateEstado(workspaceId: string, id: string, estado: 'pendiente' | 'pagada' | 'parcial' | 'vencida'): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        urlArchivo: string | null;
        userId: string;
        nroFactura: string;
        tipo: string;
        fechaEmision: Date;
        fechaVencimiento: Date | null;
        subtotal: import("@prisma/client/runtime/library").Decimal | null;
        iva: import("@prisma/client/runtime/library").Decimal | null;
        importeTotal: import("@prisma/client/runtime/library").Decimal;
        condicionFiscal: string | null;
        descripcion: string | null;
        estadoPago: string;
        clienteId: string | null;
    }>;
    remove(workspaceId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        urlArchivo: string | null;
        userId: string;
        nroFactura: string;
        tipo: string;
        fechaEmision: Date;
        fechaVencimiento: Date | null;
        subtotal: import("@prisma/client/runtime/library").Decimal | null;
        iva: import("@prisma/client/runtime/library").Decimal | null;
        importeTotal: import("@prisma/client/runtime/library").Decimal;
        condicionFiscal: string | null;
        descripcion: string | null;
        estadoPago: string;
        clienteId: string | null;
    }>;
    exportCSV(workspaceId: string, res: Response): Promise<void>;
}
export {};
