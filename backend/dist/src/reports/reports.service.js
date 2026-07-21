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
var ReportsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const ExcelJS = require("exceljs");
const date_fns_1 = require("date-fns");
let ReportsService = ReportsService_1 = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ReportsService_1.name);
    }
    async getTransactionsForReport(userId, workspaceId, filters) {
        const where = { userId, workspaceId, deletedAt: null };
        if (filters.type)
            where.type = filters.type;
        if (filters.categoryId)
            where.categoryId = filters.categoryId;
        if (filters.status)
            where.status = filters.status;
        if (filters.dateFrom || filters.dateTo) {
            where.date = {};
            if (filters.dateFrom)
                where.date.gte = new Date(filters.dateFrom);
            if (filters.dateTo)
                where.date.lte = new Date(filters.dateTo);
        }
        return this.prisma.transaction.findMany({
            where,
            include: { category: true },
            orderBy: { date: 'desc' },
        });
    }
    async getInvoicesForReport(userId, workspaceId, filters) {
        const where = { workspaceId, deletedAt: null };
        if (filters.status)
            where.status = filters.status;
        if (filters.dateFrom || filters.dateTo) {
            where.issueDate = {};
            if (filters.dateFrom)
                where.issueDate.gte = new Date(filters.dateFrom);
            if (filters.dateTo)
                where.issueDate.lte = new Date(filters.dateTo);
        }
        return this.prisma.invoice.findMany({
            where,
            include: { client: true },
            orderBy: { issueDate: 'desc' },
        });
    }
    async generateCSV(userId, workspaceId, filters) {
        const transactions = await this.getTransactionsForReport(userId, workspaceId, filters);
        const header = 'Fecha,Tipo,Categoría,Descripción,Monto,Medio de Pago,Estado\n';
        const rows = transactions.map(tx => {
            const date = (0, date_fns_1.format)(new Date(tx.date), 'dd/MM/yyyy');
            const type = tx.type === 'INCOME' ? 'Ingreso' : 'Gasto';
            const category = tx.category?.name || 'Sin categoría';
            const desc = (tx.description || '').replace(/,/g, ';');
            const amount = Number(tx.amount).toFixed(2);
            const payment = this.translatePaymentMethod(tx.paymentMethod);
            const status = this.translateStatus(tx.status);
            return `${date},${type},${category},${desc},${amount},${payment},${status}`;
        });
        return header + rows.join('\n');
    }
    async generateExcel(userId, workspaceId, filters) {
        const transactions = await this.getTransactionsForReport(userId, workspaceId, filters);
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'GESTIONAR2';
        workbook.created = new Date();
        const sheet = workbook.addWorksheet('Movimientos', {
            pageSetup: { paperSize: 9, orientation: 'landscape' },
        });
        sheet.columns = [
            { header: 'Fecha', key: 'date', width: 12 },
            { header: 'Tipo', key: 'type', width: 10 },
            { header: 'Categoría', key: 'category', width: 20 },
            { header: 'Descripción', key: 'description', width: 35 },
            { header: 'Monto (ARS)', key: 'amount', width: 16 },
            { header: 'Medio de Pago', key: 'payment', width: 18 },
            { header: 'Estado', key: 'status', width: 12 },
        ];
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF385144' } };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 30;
        let totalIncome = 0;
        let totalExpense = 0;
        for (const tx of transactions) {
            const isIncome = tx.type === 'INCOME';
            const amount = Number(tx.amount);
            if (isIncome)
                totalIncome += amount;
            else
                totalExpense += amount;
            const row = sheet.addRow({
                date: (0, date_fns_1.format)(new Date(tx.date), 'dd/MM/yyyy'),
                type: isIncome ? 'Ingreso' : 'Gasto',
                category: tx.category?.name || 'Sin categoría',
                description: tx.description || '',
                amount: amount,
                payment: this.translatePaymentMethod(tx.paymentMethod),
                status: this.translateStatus(tx.status),
            });
            row.getCell('type').fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: isIncome ? 'FFd1fae5' : 'FFfee2e2' },
            };
            row.getCell('type').font = {
                color: { argb: isIncome ? 'FF065f46' : 'FF991b1b' },
                bold: true,
            };
            row.getCell('amount').numFmt = '#,##0.00';
            row.getCell('amount').font = {
                bold: true,
                color: { argb: isIncome ? 'FF059669' : 'FFdc2626' },
            };
        }
        sheet.addRow({});
        const totalRow = sheet.addRow({
            date: 'TOTALES',
            description: `${transactions.length} movimientos`,
        });
        totalRow.font = { bold: true };
        totalRow.getCell('amount').value = totalIncome - totalExpense;
        totalRow.getCell('amount').numFmt = '#,##0.00';
        totalRow.getCell('amount').font = { bold: true, color: { argb: 'FF385144' } };
        totalRow.getCell('date').font = { bold: true };
        totalRow.getCell('description').font = { bold: true };
        const summarySheet = workbook.addWorksheet('Resumen');
        summarySheet.addRow(['Concepto', 'Monto (ARS)']);
        summarySheet.addRow(['Total Ingresos', totalIncome]);
        summarySheet.addRow(['Total Gastos', totalExpense]);
        summarySheet.addRow(['Balance', totalIncome - totalExpense]);
        summarySheet.addRow(['Total Movimientos', transactions.length]);
        summarySheet.getColumn(1).width = 25;
        summarySheet.getColumn(2).width = 20;
        summarySheet.getColumn(2).numFmt = '#,##0.00';
        const summaryHeader = summarySheet.getRow(1);
        summaryHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        summaryHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF385144' } };
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
    async generateInvoicesExcel(userId, workspaceId, filters) {
        const invoices = await this.getInvoicesForReport(userId, workspaceId, filters);
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'GESTIONAR2';
        workbook.created = new Date();
        const sheet = workbook.addWorksheet('Facturas', {
            pageSetup: { paperSize: 9, orientation: 'landscape' },
        });
        sheet.columns = [
            { header: 'N° Factura', key: 'invoiceNumber', width: 18 },
            { header: 'Cliente', key: 'client', width: 25 },
            { header: 'Fecha', key: 'issueDate', width: 12 },
            { header: 'Vencimiento', key: 'dueDate', width: 12 },
            { header: 'Total (ARS)', key: 'total', width: 16 },
            { header: 'Estado', key: 'status', width: 12 },
            { header: 'URL Archivo', key: 'urlArchivo', width: 30 },
        ];
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF385144' } };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 30;
        const statusColors = {
            PENDING: 'FFF59e0b',
            PAID: 'FF10b981',
            OVERDUE: 'FFef4444',
            CANCELLED: 'FF6b7280',
        };
        const statusLabels = {
            PENDING: 'PENDIENTE',
            PAID: 'PAGADA',
            OVERDUE: 'VENCIDA',
            CANCELLED: 'CANCELADA',
        };
        for (const inv of invoices) {
            const row = sheet.addRow({
                invoiceNumber: inv.invoiceNumber,
                client: inv.client?.name || 'Sin cliente',
                issueDate: (0, date_fns_1.format)(new Date(inv.issueDate), 'dd/MM/yyyy'),
                dueDate: (0, date_fns_1.format)(new Date(inv.dueDate), 'dd/MM/yyyy'),
                total: Number(inv.totalAmount),
                status: statusLabels[inv.status] || inv.status,
                urlArchivo: inv.urlArchivo || '-',
            });
            row.getCell('total').numFmt = '#,##0.00';
            const statusColor = statusColors[inv.status] || 'FF6b7280';
            row.getCell('status').fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: statusColor },
            };
            row.getCell('status').font = { bold: true, color: { argb: 'FFFFFFFF' } };
        }
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
    translatePaymentMethod(method) {
        const map = {
            CASH: 'Efectivo',
            BANK_TRANSFER: 'Transferencia',
            CARD: 'Tarjeta',
            CHECK: 'Cheque',
            OTHER: 'Otro',
        };
        return map[method] || method;
    }
    translateStatus(status) {
        const map = {
            CONFIRMED: 'Confirmado',
            PENDING: 'Pendiente',
            CANCELLED: 'Cancelado',
        };
        return map[status] || status;
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = ReportsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map