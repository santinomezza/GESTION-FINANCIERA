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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const date_fns_1 = require("date-fns");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOverview(workspaceId, year) {
        const targetYear = year || new Date().getFullYear();
        const from = (0, date_fns_1.startOfYear)(new Date(targetYear, 0, 1));
        const to = (0, date_fns_1.endOfYear)(new Date(targetYear, 0, 1));
        const currentMonth = new Date();
        const currentMonthFrom = (0, date_fns_1.startOfMonth)(currentMonth);
        const currentMonthTo = (0, date_fns_1.endOfMonth)(currentMonth);
        const prevMonthFrom = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(currentMonth, 1));
        const prevMonthTo = (0, date_fns_1.endOfMonth)((0, date_fns_1.subMonths)(currentMonth, 1));
        const [yearlyIncome, yearlyExpense, monthlyIncome, monthlyExpense, prevMonthlyIncome, prevMonthlyExpense, recentTransactions,] = await Promise.all([
            this.sumByType(workspaceId, 'INCOME', from, to),
            this.sumByType(workspaceId, 'EXPENSE', from, to),
            this.sumByType(workspaceId, 'INCOME', currentMonthFrom, currentMonthTo),
            this.sumByType(workspaceId, 'EXPENSE', currentMonthFrom, currentMonthTo),
            this.sumByType(workspaceId, 'INCOME', prevMonthFrom, prevMonthTo),
            this.sumByType(workspaceId, 'EXPENSE', prevMonthFrom, prevMonthTo),
            this.prisma.transaction.findMany({
                where: { workspaceId, deletedAt: null, status: 'CONFIRMED' },
                include: { category: { select: { name: true, icon: true, color: true } } },
                orderBy: { date: 'desc' },
                take: 5,
            }),
        ]);
        const yearlyBalance = yearlyIncome - yearlyExpense;
        const monthlyBalance = monthlyIncome - monthlyExpense;
        const incomeChange = prevMonthlyIncome > 0
            ? ((monthlyIncome - prevMonthlyIncome) / prevMonthlyIncome) * 100
            : 0;
        const expenseChange = prevMonthlyExpense > 0
            ? ((monthlyExpense - prevMonthlyExpense) / prevMonthlyExpense) * 100
            : 0;
        return {
            yearly: {
                totalIncome: yearlyIncome,
                totalExpense: yearlyExpense,
                balance: yearlyBalance,
                profitability: yearlyIncome > 0 ? ((yearlyBalance / yearlyIncome) * 100) : 0,
            },
            monthly: {
                totalIncome: monthlyIncome,
                totalExpense: monthlyExpense,
                balance: monthlyBalance,
                incomeChange: Math.round(incomeChange * 10) / 10,
                expenseChange: Math.round(expenseChange * 10) / 10,
            },
            recentTransactions,
        };
    }
    async getExpensesDashboard(workspaceId, months = 6) {
        const now = new Date();
        const from = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(now, months - 1));
        const to = (0, date_fns_1.endOfMonth)(now);
        const [byCategory, monthly, topCategories] = await Promise.all([
            this.getByCategory(workspaceId, 'EXPENSE', from, to),
            this.getMonthlyEvolution(workspaceId, 'EXPENSE', months),
            this.getTopCategories(workspaceId, 'EXPENSE', from, to, 5),
        ]);
        const totalExpense = byCategory.reduce((sum, c) => sum + c.total, 0);
        const currentMonthTotal = await this.sumByType(workspaceId, 'EXPENSE', (0, date_fns_1.startOfMonth)(now), (0, date_fns_1.endOfMonth)(now));
        const prevMonthTotal = await this.sumByType(workspaceId, 'EXPENSE', (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(now, 1)), (0, date_fns_1.endOfMonth)((0, date_fns_1.subMonths)(now, 1)));
        const variation = prevMonthTotal > 0 ? ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100 : 0;
        return {
            byCategory,
            monthly,
            topCategories,
            summary: {
                total: totalExpense,
                currentMonth: currentMonthTotal,
                prevMonth: prevMonthTotal,
                variation: Math.round(variation * 10) / 10,
                topCategory: topCategories[0] || null,
            },
        };
    }
    async getIncomeDashboard(workspaceId, months = 6) {
        const now = new Date();
        const from = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(now, months - 1));
        const to = (0, date_fns_1.endOfMonth)(now);
        const [byCategory, monthly, topCategories] = await Promise.all([
            this.getByCategory(workspaceId, 'INCOME', from, to),
            this.getMonthlyEvolution(workspaceId, 'INCOME', months),
            this.getTopCategories(workspaceId, 'INCOME', from, to, 5),
        ]);
        const totalIncome = byCategory.reduce((sum, c) => sum + c.total, 0);
        const currentMonthTotal = await this.sumByType(workspaceId, 'INCOME', (0, date_fns_1.startOfMonth)(now), (0, date_fns_1.endOfMonth)(now));
        const prevMonthTotal = await this.sumByType(workspaceId, 'INCOME', (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(now, 1)), (0, date_fns_1.endOfMonth)((0, date_fns_1.subMonths)(now, 1)));
        const avgMonthly = totalIncome / months;
        const variation = prevMonthTotal > 0 ? ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100 : 0;
        return {
            byCategory,
            monthly,
            topCategories,
            summary: {
                total: totalIncome,
                currentMonth: currentMonthTotal,
                prevMonth: prevMonthTotal,
                avgMonthly: Math.round(avgMonthly),
                variation: Math.round(variation * 10) / 10,
                topSource: topCategories[0] || null,
            },
        };
    }
    async getProfitabilityDashboard(workspaceId, months = 12) {
        const now = new Date();
        const monthsData = await this.getMonthlyComparison(workspaceId, months);
        const currentMonth = {
            income: await this.sumByType(workspaceId, 'INCOME', (0, date_fns_1.startOfMonth)(now), (0, date_fns_1.endOfMonth)(now)),
            expense: await this.sumByType(workspaceId, 'EXPENSE', (0, date_fns_1.startOfMonth)(now), (0, date_fns_1.endOfMonth)(now)),
        };
        const yearFrom = (0, date_fns_1.startOfYear)(now);
        const yearTo = (0, date_fns_1.endOfYear)(now);
        const yearlyIncome = await this.sumByType(workspaceId, 'INCOME', yearFrom, yearTo);
        const yearlyExpense = await this.sumByType(workspaceId, 'EXPENSE', yearFrom, yearTo);
        const yearlyBalance = yearlyIncome - yearlyExpense;
        const grossMargin = yearlyIncome > 0 ? ((yearlyBalance / yearlyIncome) * 100) : 0;
        const netCashFlow = currentMonth.income - currentMonth.expense;
        const totalIncome = monthsData.reduce((sum, m) => sum + m.income, 0);
        const totalExpense = monthsData.reduce((sum, m) => sum + m.expense, 0);
        const accumulated = totalIncome - totalExpense;
        return {
            monthly: monthsData,
            currentMonth: {
                ...currentMonth,
                balance: netCashFlow,
                profitability: currentMonth.income > 0 ? ((netCashFlow / currentMonth.income) * 100) : 0,
            },
            yearly: {
                income: yearlyIncome,
                expense: yearlyExpense,
                balance: yearlyBalance,
                grossMargin: Math.round(grossMargin * 10) / 10,
            },
            accumulated: {
                income: totalIncome,
                expense: totalExpense,
                balance: accumulated,
                netCashFlow,
            },
        };
    }
    async sumByType(workspaceId, type, from, to) {
        const result = await this.prisma.transaction.aggregate({
            where: { workspaceId, type, deletedAt: null, status: 'CONFIRMED', date: { gte: from, lte: to } },
            _sum: { amount: true },
        });
        return Number(result._sum.amount || 0);
    }
    async getByCategory(workspaceId, type, from, to) {
        const results = await this.prisma.transaction.groupBy({
            by: ['categoryId'],
            where: { workspaceId, type, deletedAt: null, status: 'CONFIRMED', date: { gte: from, lte: to } },
            _sum: { amount: true },
            _count: true,
            orderBy: { _sum: { amount: 'desc' } },
        });
        const categories = await this.prisma.category.findMany({
            where: { id: { in: results.map(r => r.categoryId).filter(Boolean) } },
        });
        return results.map(r => {
            const cat = categories.find(c => c.id === r.categoryId);
            return {
                categoryId: r.categoryId,
                name: cat?.name || 'Sin categoría',
                icon: cat?.icon || 'tag',
                color: cat?.color || '#6b7280',
                total: Number(r._sum.amount || 0),
                count: r._count,
            };
        });
    }
    async getMonthlyEvolution(workspaceId, type, months) {
        const now = new Date();
        const results = [];
        for (let i = months - 1; i >= 0; i--) {
            const date = (0, date_fns_1.subMonths)(now, i);
            const from = (0, date_fns_1.startOfMonth)(date);
            const to = (0, date_fns_1.endOfMonth)(date);
            const total = await this.sumByType(workspaceId, type, from, to);
            results.push({
                month: (0, date_fns_1.format)(date, 'MMM yyyy'),
                monthKey: (0, date_fns_1.format)(date, 'yyyy-MM'),
                total,
            });
        }
        return results;
    }
    async getMonthlyComparison(workspaceId, months) {
        const now = new Date();
        const results = [];
        for (let i = months - 1; i >= 0; i--) {
            const date = (0, date_fns_1.subMonths)(now, i);
            const from = (0, date_fns_1.startOfMonth)(date);
            const to = (0, date_fns_1.endOfMonth)(date);
            const [income, expense] = await Promise.all([
                this.sumByType(workspaceId, 'INCOME', from, to),
                this.sumByType(workspaceId, 'EXPENSE', from, to),
            ]);
            results.push({
                month: (0, date_fns_1.format)(date, 'MMM yyyy'),
                monthKey: (0, date_fns_1.format)(date, 'yyyy-MM'),
                income,
                expense,
                balance: income - expense,
            });
        }
        return results;
    }
    async getTopCategories(workspaceId, type, from, to, limit) {
        const data = await this.getByCategory(workspaceId, type, from, to);
        return data.slice(0, limit);
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map