declare class PayerDto {
    name: string;
    amount: number;
}
export declare class SplitExpenseDto {
    payers: PayerDto[];
    description?: string;
}
export {};
