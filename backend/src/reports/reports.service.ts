import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private prisma: PrismaService) {}

  async getTransactionsForReport(userId: string, workspaceId: string, filters: any) {
    const where: any = { userId, workspaceId, deletedAt: null };

    if (filters.type) where.type = filters.type;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.status) where.status = filters.status;
    if (filters.dateFrom || filters.dateTo) {
      where.date = {};
      if (filters.dateFrom) where.date.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.date.lte = new Date(filters.dateTo);
    }

    return this.prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: 'desc' },
    });
  }

  async getInvoicesForReport(userId: string, workspaceId: string, filters: any) {
    const where: any = { workspaceId, deletedAt: null };

    if (filters.status) where.status = filters.status;
    if (filters.dateFrom || filters.dateTo) {
      where.issueDate = {};
      if (filters.dateFrom) where.issueDate.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.issueDate.lte = new Date(filters.dateTo);
    }

    return this.prisma.invoice.findMany({
      where,
      include: { client: true },
      orderBy: { issueDate: 'desc' },
    });
  }

  async generateCSV(userId: string, workspaceId: string, filters: any): Promise<string> {
    const transactions = await this.getTransactionsForReport(userId, workspaceId, filters);

    const header = 'Fecha,Tipo,Categoría,Descripción,Monto,Medio de Pago,Estado\n';
    const rows = transactions.map(tx => {
      const date = format(new Date(tx.date), 'dd/MM/yyyy');
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

  async generateExcel(userId: string, workspaceId: string, filters: any): Promise<Buffer> {
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
      if (isIncome) totalIncome += amount; else totalExpense += amount;

      const row = sheet.addRow({
        date: format(new Date(tx.date), 'dd/MM/yyyy'),
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

  async generateInvoicesExcel(userId: string, workspaceId: string, filters: any): Promise<Buffer> {
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

    const statusColors: Record<string, string> = {
      PENDING: 'FFF59e0b',
      PAID: 'FF10b981',
      OVERDUE: 'FFef4444',
      CANCELLED: 'FF6b7280',
    };

    const statusLabels: Record<string, string> = {
      PENDING: 'PENDIENTE',
      PAID: 'PAGADA',
      OVERDUE: 'VENCIDA',
      CANCELLED: 'CANCELADA',
    };

    for (const inv of invoices) {
      const row = sheet.addRow({
        invoiceNumber: inv.invoiceNumber,
        client: inv.client?.name || 'Sin cliente',
        issueDate: format(new Date(inv.issueDate), 'dd/MM/yyyy'),
        dueDate: format(new Date(inv.dueDate), 'dd/MM/yyyy'),
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

  private translatePaymentMethod(method: string): string {
    const map: Record<string, string> = {
      CASH: 'Efectivo',
      BANK_TRANSFER: 'Transferencia',
      CARD: 'Tarjeta',
      CHECK: 'Cheque',
      OTHER: 'Otro',
    };
    return map[method] || method;
  }

  private translateStatus(status: string): string {
    const map: Record<string, string> = {
      CONFIRMED: 'Confirmado',
      PENDING: 'Pendiente',
      CANCELLED: 'Cancelado',
    };
    return map[status] || status;
  }
}
