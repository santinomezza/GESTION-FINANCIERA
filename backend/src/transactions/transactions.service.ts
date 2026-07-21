import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionsDto } from './dto/filter-transactions.dto';
import { Prisma, TransactionType, TransactionStatus, PaymentMethod, CategoryType } from '@prisma/client';
import { CategoryLimitsService } from '../category-limits/category-limits.service';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private categoryLimitsService: CategoryLimitsService,
  ) { }

  async create(workspaceId: string, createTransactionDto: CreateTransactionDto, createdById?: string) {
    let categoryId = createTransactionDto.categoryId;

    if (createTransactionDto.categoryName && !categoryId) {
      const existingCategory = await this.prisma.category.findFirst({
        where: {
          workspaceId,
          name: { equals: createTransactionDto.categoryName, mode: 'insensitive' },
        },
      });

      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        const categoryType = createTransactionDto.type === TransactionType.INCOME
          ? CategoryType.INCOME
          : createTransactionDto.type === TransactionType.EXPENSE
            ? CategoryType.EXPENSE
            : CategoryType.MIXED;

        const newCategory = await this.prisma.category.create({
          data: {
            name: createTransactionDto.categoryName,
            workspaceId,
            type: categoryType,
            icon: 'tag',
            color: '#385144',
            sortOrder: 0,
          },
        });
        categoryId = newCategory.id;
      }
    }

    return this.prisma.transaction.create({
      data: {
        type: createTransactionDto.type,
        amount: new Prisma.Decimal(createTransactionDto.amount),
        categoryId,
        description: createTransactionDto.description,
        date: createTransactionDto.date ? new Date(createTransactionDto.date) : new Date(),
        paymentMethod: createTransactionDto.paymentMethod,
        status: createTransactionDto.status,
        source: createTransactionDto.source,
        telegramMsgId: createTransactionDto.telegramMsgId,
        invoiceId: createTransactionDto.invoiceId,
        goalId: createTransactionDto.goalId,
        notes: createTransactionDto.notes,
        workspaceId,
        createdById,
      },
      include: { category: true, createdBy: { select: { id: true, name: true, email: true } } },
    } as any);
  }

  findAll(workspaceId: string, filterDto: FilterTransactionsDto = {}) {
    const {
      type,
      categoryId,
      createdById,
      status,
      paymentMethod,
      dateFrom,
      dateTo,
      search,
      page = 1,
      limit = 50,
      orderBy = 'date',
      order = 'desc',
    } = filterDto;

    const where: Prisma.TransactionWhereInput = {
      workspaceId,
      deletedAt: null,
      ...(type && { type: type as TransactionType }),
      ...(categoryId && { categoryId }),
      ...(createdById && { createdById }),
      ...(status && { status: status as TransactionStatus }),
      ...(paymentMethod && { paymentMethod: paymentMethod as PaymentMethod }),
      ...(dateFrom && { date: { gte: new Date(dateFrom) } }),
      ...(dateTo && { date: { lte: new Date(dateTo) } }),
      ...(search && {
        OR: [
          { description: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const skip = (page - 1) * limit;

    return this.prisma.transaction.findMany({
      where,
      include: { category: true, createdBy: { select: { id: true, name: true, email: true } } },
      orderBy: { [orderBy]: order },
      skip,
      take: limit,
    });
  }

  async findOne(workspaceId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, workspaceId, deletedAt: null },
      include: { category: true },
    });
    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada');
    }
    return transaction;
  }

  async update(workspaceId: string, id: string, updateTransactionDto: UpdateTransactionDto) {
    await this.findOne(workspaceId, id);
    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...updateTransactionDto,
        ...(updateTransactionDto.amount && { amount: new Prisma.Decimal(updateTransactionDto.amount) }),
      },
      include: { category: true },
    });
  }

  async remove(workspaceId: string, id: string) {
    await this.findOne(workspaceId, id);
    return this.prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async duplicate(workspaceId: string, id: string, createdById?: string) {
    const original = await this.findOne(workspaceId, id);
    const today = new Date();
    return this.prisma.transaction.create({
      data: {
        type: original.type,
        amount: original.amount,
        workspaceId,
        categoryId: original.categoryId,
        description: original.description ? `${original.description} (copia)` : '(copia)',
        date: today,
        paymentMethod: original.paymentMethod,
        status: 'PENDING',
        source: 'web',
        createdById,
      },
      include: { category: true, createdBy: { select: { id: true, name: true, email: true } } },
    } as any);
  }

  async checkCategoryLimit(workspaceId: string, categoryId: string, amount: number) {
    return this.categoryLimitsService.checkLimit(workspaceId, categoryId, amount);
  }
}