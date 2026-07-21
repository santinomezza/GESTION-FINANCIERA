import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from './common/prisma/prisma.service';
import { CreateInvoiceDto } from './create-invoice.dto';
import { UpdateInvoiceDto } from './update-invoice.dto';
import { Prisma, TransactionType } from '@prisma/client';
import { AiService } from './ai/ai.service';

@Injectable()
export class InvoicesService {
    private readonly logger = new Logger(InvoicesService.name);

    constructor(
        private prisma: PrismaService,
        private aiService: AiService,
    ) { }

    create(workspaceId: string, createInvoiceDto: CreateInvoiceDto) {
        return this.prisma.invoice.create({
            data: {
                invoiceNumber: createInvoiceDto.invoiceNumber,
                issueDate: createInvoiceDto.issueDate,
                dueDate: createInvoiceDto.dueDate,
                totalAmount: createInvoiceDto.totalAmount,
                status: createInvoiceDto.status,
                clientId: createInvoiceDto.clientId || null,
                workspaceId,
                urlArchivo: createInvoiceDto.urlArchivo || null,
            } as any,
        });
    }

    findAll(workspaceId: string, clientId?: string) {
        const where: any = { workspaceId, deletedAt: null };
        if (clientId) {
            where.clientId = clientId;
        }
        return this.prisma.invoice.findMany({
            where,
            include: { client: true },
            orderBy: { issueDate: 'desc' },
        });
    }

    async findOne(workspaceId: string, id: string) {
        const invoice = await this.prisma.invoice.findFirst({
            where: { id, workspaceId, deletedAt: null },
            include: { client: true, transactions: true },
        });
        if (!invoice) {
            throw new NotFoundException('Factura no encontrada');
        }
        return invoice;
    }

    async update(workspaceId: string, id: string, updateInvoiceDto: UpdateInvoiceDto) {
        await this.findOne(workspaceId, id); // check existence and ownership
        return this.prisma.invoice.update({
            where: { id },
            data: updateInvoiceDto,
        });
    }

    async remove(workspaceId: string, id: string) {
        await this.findOne(workspaceId, id); // check existence and ownership
        return this.prisma.invoice.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    async markAsPaid(workspaceId: string, id: string, paymentDate: Date) {
        const invoice = await this.findOne(workspaceId, id);
        if (invoice.status === 'PAID') {
            throw new ConflictException('La factura ya ha sido pagada.');
        }

        return this.prisma.$transaction(async (tx) => {
            const updatedInvoice = await tx.invoice.update({
                where: { id },
                data: { status: 'PAID' },
            });

            await tx.transaction.create({
                data: {
                    workspaceId,
                    amount: new Prisma.Decimal(invoice.totalAmount),
                    type: TransactionType.INCOME,
                    date: paymentDate,
                    description: `Cobro de factura #${invoice.invoiceNumber}${invoice.client ? ' - ' + invoice.client.name : ''}`,
                    invoiceId: invoice.id,
                    status: 'CONFIRMED',
                },
            } as any);

            return updatedInvoice;
        });
    }

    async extractInvoiceData(fileBuffer: Buffer, mimeType: string) {
        try {
            return await this.aiService.extractInvoice(fileBuffer, mimeType);
        } catch (err) {
            this.logger.error('Error extrayendo datos de factura:', err);
            throw err;
        }
    }
}