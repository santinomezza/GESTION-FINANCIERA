import { PrismaService } from '../common/prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getOverview(workspaceId: string, year?: number): Promise<{
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
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            type: import(".prisma/client").$Enums.TransactionType;
            workspaceId: string;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: import(".prisma/client").$Enums.Currency;
            notes: string | null;
            date: Date;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            status: import(".prisma/client").$Enums.TransactionStatus;
            source: string;
            telegramMsgId: string | null;
            categoryId: string | null;
            invoiceId: string | null;
            goalId: string | null;
            recurringTransactionId: string | null;
            createdById: string | null;
        })[];
    }>;
    getExpensesDashboard(workspaceId: string, months?: number): Promise<{
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
    getIncomeDashboard(workspaceId: string, months?: number): Promise<{
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
    getProfitabilityDashboard(workspaceId: string, months?: number): Promise<{
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
    private sumByType;
    private getByCategory;
    private getMonthlyEvolution;
    private getMonthlyComparison;
    private getTopCategories;
}
