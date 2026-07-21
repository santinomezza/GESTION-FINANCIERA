import { SplitExpenseDto } from './split-expense.dto';
import { SplitService } from './split.service';
export declare class SplitController {
    private readonly splitService;
    constructor(splitService: SplitService);
    splitExpense(splitExpenseDto: SplitExpenseDto): import("./split.service").SplitResult;
}
