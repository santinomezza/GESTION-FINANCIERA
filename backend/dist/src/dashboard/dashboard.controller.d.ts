import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getOverview(workspaceId: string, year?: string): Promise<{
        yearly: {
            totalIncome: number;
            totalExpense: number;
            balance: number;
            profitability: number;
        };
        monthly: {
            totalIncome: number;
            totalExpense: number;
            balance: number;
            incomeChange: number;
            expenseChange: number;
        };
        recentTransactions: ({
            category: {
                name: string;
                icon: string;
                color: string;
            };
        } & {
            id: string;
            workspaceId: string;
            categoryId: string | null;
            type: import(".prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: import(".prisma/client").$Enums.Currency;
            description: string | null;
            notes: string | null;
            date: Date;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            status: import(".prisma/client").$Enums.TransactionStatus;
            source: string;
            telegramMsgId: string | null;
            invoiceId: string | null;
            goalId: string | null;
            recurringTransactionId: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdById: string | null;
        })[];
    }>;
    getExpensesDashboard(workspaceId: string, months?: string): Promise<{
        byCategory: {
            categoryId: string;
            name: string;
            icon: string;
            color: string;
            total: number;
            count: number;
        }[];
        monthly: any[];
        topCategories: {
            categoryId: string;
            name: string;
            icon: string;
            color: string;
            total: number;
            count: number;
        }[];
        summary: {
            total: number;
            currentMonth: number;
            prevMonth: number;
            variation: number;
            topCategory: {
                categoryId: string;
                name: string;
                icon: string;
                color: string;
                total: number;
                count: number;
            };
        };
    }>;
    getIncomeDashboard(workspaceId: string, months?: string): Promise<{
        byCategory: {
            categoryId: string;
            name: string;
            icon: string;
            color: string;
            total: number;
            count: number;
        }[];
        monthly: any[];
        topCategories: {
            categoryId: string;
            name: string;
            icon: string;
            color: string;
            total: number;
            count: number;
        }[];
        summary: {
            total: number;
            currentMonth: number;
            prevMonth: number;
            avgMonthly: number;
            variation: number;
            topSource: {
                categoryId: string;
                name: string;
                icon: string;
                color: string;
                total: number;
                count: number;
            };
        };
    }>;
    getProfitabilityDashboard(workspaceId: string, months?: string): Promise<{
        monthly: any[];
        currentMonth: {
            balance: number;
            profitability: number;
            income: number;
            expense: number;
        };
        yearly: {
            income: number;
            expense: number;
            balance: number;
            grossMargin: number;
        };
        accumulated: {
            income: any;
            expense: any;
            balance: number;
            netCashFlow: number;
        };
    }>;
}
