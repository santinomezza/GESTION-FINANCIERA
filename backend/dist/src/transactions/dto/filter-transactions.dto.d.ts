export declare class FilterTransactionsDto {
    type?: string;
    categoryId?: string;
    createdById?: string;
    status?: string;
    paymentMethod?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: 'asc' | 'desc';
}
