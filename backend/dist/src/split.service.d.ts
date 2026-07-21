import { SplitExpenseDto } from './split-expense.dto';
export interface Balance {
    name: string;
    paid: number;
    shouldPay: number;
    balance: number;
}
export interface Settlement {
    from: string;
    to: string;
    amount: number;
}
export interface SplitResult {
    total: number;
    perPerson: number;
    balances: Balance[];
    settlements: Settlement[];
    summary: string;
}
export declare class SplitService {
    calculate(splitExpenseDto: SplitExpenseDto): SplitResult;
}
