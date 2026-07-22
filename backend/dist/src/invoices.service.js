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
var InvoicesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./common/prisma/prisma.service");
const client_1 = require("@prisma/client");
const ai_service_1 = require("./ai/ai.service");
let InvoicesService = InvoicesService_1 = class InvoicesService {
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
        this.logger = new common_1.Logger(InvoicesService_1.name);
    }
    create(workspaceId, createInvoiceDto) {
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
            },
        });
    }
    findAll(workspaceId, clientId) {
        const where = { workspaceId, deletedAt: null };
        if (clientId) {
            where.clientId = clientId;
        }
        return this.prisma.invoice.findMany({
            where,
            include: { client: true },
            orderBy: { issueDate: 'desc' },
        });
    }
    async findOne(workspaceId, id) {
        const invoice = await this.prisma.invoice.findFirst({
            where: { id, workspaceId, deletedAt: null },
            include: { client: true, transactions: true },
        });
        if (!invoice) {
            throw new common_1.NotFoundException('Factura no encontrada');
        }
        return invoice;
    }
    async update(workspaceId, id, updateInvoiceDto) {
        await this.findOne(workspaceId, id);
        return this.prisma.invoice.update({
            where: { id },
            data: updateInvoiceDto,
        });
    }
    async remove(workspaceId, id) {
        await this.findOne(workspaceId, id);
        return this.prisma.invoice.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async markAsPaid(workspaceId, id, paymentDate) {
        const invoice = await this.findOne(workspaceId, id);
        if (invoice.status === 'PAID') {
            throw new common_1.ConflictException('La factura ya ha sido pagada.');
        }
        const payment = paymentDate || new Date();
        return this.prisma.$transaction(async (tx) => {
            const updatedInvoice = await tx.invoice.update({
                where: { id },
                data: { status: 'PAID' },
            });
            await tx.transaction.create({
                data: {
                    workspaceId,
                    amount: new client_1.Prisma.Decimal(invoice.totalAmount),
                    type: client_1.TransactionType.INCOME,
                    date: payment,
                    description: `Cobro de factura #${invoice.invoiceNumber}${invoice.client ? ' - ' + invoice.client.name : ''}`,
                    invoiceId: invoice.id,
                    status: 'CONFIRMED',
                },
            });
            return updatedInvoice;
        });
    }
    async extractInvoiceData(fileBuffer, mimeType) {
        try {
            return await this.aiService.extractInvoice(fileBuffer, mimeType);
        }
        catch (err) {
            this.logger.error('Error extrayendo datos de factura:', err);
            throw err;
        }
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = InvoicesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map