import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { TransactionType } from '@prisma/client';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, format, eachMonthOfInterval } from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) { }

  // ==========================================
  // OVERVIEW GENERAL
  // ==========================================
  async getOverview(workspaceId: string, year?: number) {
    const targetYear = year || new Date().getFullYear();
    const from = startOfYear(new Date(targetYear, 0, 1));
    const to = endOfYear(new Date(targetYear, 0, 1));

    const currentMonth = new Date();
    const currentMonthFrom = startOfMonth(currentMonth);
    const currentMonthTo = endOfMonth(currentMonth);
    const prevMonthFrom = startOfMonth(subMonths(currentMonth, 1));
    const prevMonthTo = endOfMonth(subMonths(currentMonth, 1));

    const [
      yearlyIncome, yearlyExpense,
      monthlyIncome, monthlyExpense,
      prevMonthlyIncome, prevMonthlyExpense,
      recentTransactions,
    ] = await Promise.all([
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

  // ==========================================
  // DASHBOARD DE GASTOS
  // ==========================================
  async getExpensesDashboard(workspaceId: string, months = 6) {
    const now = new Date();
    const from = startOfMonth(subMonths(now, months - 1));
    const to = endOfMonth(now);

    const [byCategory, monthly, topCategories] = await Promise.all([
      this.getByCategory(workspaceId, 'EXPENSE', from, to),
      this.getMonthlyEvolution(workspaceId, 'EXPENSE', months),
      this.getTopCategories(workspaceId, 'EXPENSE', from, to, 5),
    ]);

    const totalExpense = byCategory.reduce((sum, c) => sum + c.total, 0);

    // Variación vs mes anterior
    const currentMonthTotal = await this.sumByType(workspaceId, 'EXPENSE', startOfMonth(now), endOfMonth(now));
    const prevMonthTotal = await this.sumByType(workspaceId, 'EXPENSE', startOfMonth(subMonths(now, 1)), endOfMonth(subMonths(now, 1)));
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

  // ==========================================
  // DASHBOARD DE INGRESOS
  // ==========================================
  async getIncomeDashboard(workspaceId: string, months = 6) {
    const now = new Date();
    const from = startOfMonth(subMonths(now, months - 1));
    const to = endOfMonth(now);

    const [byCategory, monthly, topCategories] = await Promise.all([
      this.getByCategory(workspaceId, 'INCOME', from, to),
      this.getMonthlyEvolution(workspaceId, 'INCOME', months),
      this.getTopCategories(workspaceId, 'INCOME', from, to, 5),
    ]);

    const totalIncome = byCategory.reduce((sum, c) => sum + c.total, 0);
    const currentMonthTotal = await this.sumByType(workspaceId, 'INCOME', startOfMonth(now), endOfMonth(now));
    const prevMonthTotal = await this.sumByType(workspaceId, 'INCOME', startOfMonth(subMonths(now, 1)), endOfMonth(subMonths(now, 1)));

    // Promedio mensual
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

  // ==========================================
  // DASHBOARD DE RENTABILIDAD
  // ==========================================
  async getProfitabilityDashboard(workspaceId: string, months = 12) {
    const now = new Date();
    const monthsData = await this.getMonthlyComparison(workspaceId, months);

    const currentMonth = {
      income: await this.sumByType(workspaceId, 'INCOME', startOfMonth(now), endOfMonth(now)),
      expense: await this.sumByType(workspaceId, 'EXPENSE', startOfMonth(now), endOfMonth(now)),
    };

    const yearFrom = startOfYear(now);
    const yearTo = endOfYear(now);
    const yearlyIncome = await this.sumByType(workspaceId, 'INCOME', yearFrom, yearTo);
    const yearlyExpense = await this.sumByType(workspaceId, 'EXPENSE', yearFrom, yearTo);
    const yearlyBalance = yearlyIncome - yearlyExpense;

    const grossMargin = yearlyIncome > 0 ? ((yearlyBalance / yearlyIncome) * 100) : 0;
    const netCashFlow = currentMonth.income - currentMonth.expense;

    // Acumulado
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

  // ==========================================
  // HELPERS PRIVADOS
  // ==========================================
  private async sumByType(workspaceId: string, type: TransactionType, from: Date, to: Date): Promise<number> {
    const result = await this.prisma.transaction.aggregate({
      where: { workspaceId, type, deletedAt: null, status: 'CONFIRMED', date: { gte: from, lte: to } },
      _sum: { amount: true },
    });
    return Number(result._sum.amount || 0);
  }

  private async getByCategory(workspaceId: string, type: TransactionType, from: Date, to: Date) {
    const results = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { workspaceId, type, deletedAt: null, status: 'CONFIRMED', date: { gte: from, lte: to } },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
    });

    const categories = await this.prisma.category.findMany({
      where: { id: { in: results.map(r => r.categoryId).filter(Boolean) as string[] } },
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

  private async getMonthlyEvolution(workspaceId: string, type: TransactionType, months: number) {
    const now = new Date();
    const results = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(now, i);
      const from = startOfMonth(date);
      const to = endOfMonth(date);
      const total = await this.sumByType(workspaceId, type, from, to);
      results.push({
        month: format(date, 'MMM yyyy'),
        monthKey: format(date, 'yyyy-MM'),
        total,
      });
    }
    return results;
  }

  private async getMonthlyComparison(workspaceId: string, months: number) {
    const now = new Date();
    const results = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(now, i);
      const from = startOfMonth(date);
      const to = endOfMonth(date);
      const [income, expense] = await Promise.all([
        this.sumByType(workspaceId, 'INCOME', from, to),
        this.sumByType(workspaceId, 'EXPENSE', from, to),
      ]);
      results.push({
        month: format(date, 'MMM yyyy'),
        monthKey: format(date, 'yyyy-MM'),
        income,
        expense,
        balance: income - expense,
      });
    }
    return results;
  }

  private async getTopCategories(workspaceId: string, type: TransactionType, from: Date, to: Date, limit: number) {
    const data = await this.getByCategory(workspaceId, type, from, to);
    return data.slice(0, limit);
  }
}
