declare const INVOICE_STATUSES: readonly ["PENDING", "PAID", "OVERDUE", "CANCELLED"];
type InvoiceStatus = typeof INVOICE_STATUSES[number];
export declare class CreateInvoiceDto {
    invoiceNumber: string;
    issueDate: Date;
    dueDate: Date;
    totalAmount: number;
    status: InvoiceStatus;
    clientId?: string;
    urlArchivo?: string;
    file?: string;
    fileMimeType?: string;
}
export {};
