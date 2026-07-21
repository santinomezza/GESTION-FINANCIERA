import { TransactionType, PaymentMethod, TransactionStatus } from '@prisma/client';
export declare class CreateTransactionDto {
    date: string;
    amount: number;
    description?: string;
    notes?: string;
    type: TransactionType;
    categoryId?: string;
    categoryName?: string;
    paymentMethod?: PaymentMethod;
    status?: TransactionStatus;
    source?: string;
    telegramMsgId?: string;
    invoiceId?: string;
    goalId?: string;
}
