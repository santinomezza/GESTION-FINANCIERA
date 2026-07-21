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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
const category_limits_service_1 = require("../category-limits/category-limits.service");
let TransactionsService = class TransactionsService {
    constructor(prisma, categoryLimitsService) {
        this.prisma = prisma;
        this.categoryLimitsService = categoryLimitsService;
    }
    async create(workspaceId, createTransactionDto, createdById) {
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
            }
            else {
                const categoryType = createTransactionDto.type === client_1.TransactionType.INCOME
                    ? client_1.CategoryType.INCOME
                    : createTransactionDto.type === client_1.TransactionType.EXPENSE
                        ? client_1.CategoryType.EXPENSE
                        : client_1.CategoryType.MIXED;
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
                amount: new client_1.Prisma.Decimal(createTransactionDto.amount),
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
        });
    }
    findAll(workspaceId, filterDto = {}) {
        const { type, categoryId, createdById, status, paymentMethod, dateFrom, dateTo, search, page = 1, limit = 50, orderBy = 'date', order = 'desc', } = filterDto;
        const where = {
            workspaceId,
            deletedAt: null,
            ...(type && { type: type }),
            ...(categoryId && { categoryId }),
            ...(createdById && { createdById }),
            ...(status && { status: status }),
            ...(paymentMethod && { paymentMethod: paymentMethod }),
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
    async findOne(workspaceId, id) {
        const transaction = await this.prisma.transaction.findFirst({
            where: { id, workspaceId, deletedAt: null },
            include: { category: true },
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transacción no encontrada');
        }
        return transaction;
    }
    async update(workspaceId, id, updateTransactionDto) {
        await this.findOne(workspaceId, id);
        return this.prisma.transaction.update({
            where: { id },
            data: {
                ...updateTransactionDto,
                ...(updateTransactionDto.amount && { amount: new client_1.Prisma.Decimal(updateTransactionDto.amount) }),
            },
            include: { category: true },
        });
    }
    async remove(workspaceId, id) {
        await this.findOne(workspaceId, id);
        return this.prisma.transaction.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async duplicate(workspaceId, id, createdById) {
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
        });
    }
    async checkCategoryLimit(workspaceId, categoryId, amount) {
        return this.categoryLimitsService.checkLimit(workspaceId, categoryId, amount);
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        category_limits_service_1.CategoryLimitsService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map