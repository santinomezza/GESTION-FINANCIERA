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
exports.GoalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const library_1 = require("@prisma/client/runtime/library");
let GoalsService = class GoalsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(workspaceId) {
        return this.prisma.goal.findMany({
            where: { workspaceId, deletedAt: null },
            orderBy: [{ isCompleted: 'asc' }, { createdAt: 'desc' }],
        });
    }
    async findOne(workspaceId, id) {
        const goal = await this.prisma.goal.findFirst({
            where: { id, workspaceId, deletedAt: null },
        });
        if (!goal)
            throw new common_1.NotFoundException('Meta no encontrada');
        return goal;
    }
    async create(workspaceId, dto) {
        const targetDecimal = new library_1.Decimal(dto.targetAmount);
        return this.prisma.goal.create({
            data: {
                name: dto.name,
                description: dto.description,
                targetAmount: targetDecimal,
                category: dto.category,
                targetDate: dto.targetDate ? new Date(dto.targetDate) : null,
                isActive: dto.isActive ?? true,
                workspaceId,
            },
        });
    }
    async update(workspaceId, id, dto) {
        const goal = await this.findOne(workspaceId, id);
        const data = {};
        if (dto.name !== undefined)
            data.name = dto.name;
        if (dto.description !== undefined)
            data.description = dto.description;
        if (dto.targetAmount !== undefined)
            data.targetAmount = new library_1.Decimal(dto.targetAmount);
        if (dto.category !== undefined)
            data.category = dto.category;
        if (dto.targetDate !== undefined)
            data.targetDate = dto.targetDate ? new Date(dto.targetDate) : null;
        if (dto.isCompleted !== undefined)
            data.isCompleted = dto.isCompleted;
        if (dto.isActive !== undefined)
            data.isActive = dto.isActive;
        return this.prisma.goal.update({
            where: { id: goal.id },
            data,
        });
    }
    async remove(workspaceId, id) {
        const goal = await this.findOne(workspaceId, id);
        return this.prisma.goal.update({
            where: { id: goal.id },
            data: { deletedAt: new Date() },
        });
    }
    async addToGoal(workspaceId, id, amount) {
        const goal = await this.findOne(workspaceId, id);
        const newCurrent = new library_1.Decimal(goal.currentAmount.toString()).add(new library_1.Decimal(amount));
        const target = new library_1.Decimal(goal.targetAmount.toString());
        const isCompleted = newCurrent.greaterThanOrEqualTo(target);
        return this.prisma.goal.update({
            where: { id: goal.id },
            data: {
                currentAmount: newCurrent,
                isCompleted,
            },
        });
    }
    async getStats(workspaceId) {
        const goals = await this.prisma.goal.findMany({
            where: { workspaceId },
        });
        const totalGoals = goals.length;
        const activeGoals = goals.filter((g) => g.isActive && !g.isCompleted).length;
        const completedGoals = goals.filter((g) => g.isCompleted).length;
        const totalTarget = goals.reduce((sum, g) => sum.add(new library_1.Decimal(g.targetAmount.toString())), new library_1.Decimal('0'));
        const totalSaved = goals.reduce((sum, g) => sum.add(new library_1.Decimal(g.currentAmount.toString())), new library_1.Decimal('0'));
        const completionRate = totalTarget.greaterThan(0)
            ? totalSaved.div(totalTarget).mul(100)
            : new library_1.Decimal('0');
        return {
            totalGoals,
            activeGoals,
            completedGoals,
            totalTarget: totalTarget.toFixed(2),
            totalSaved: totalSaved.toFixed(2),
            completionRate: completionRate.toFixed(2),
        };
    }
};
exports.GoalsService = GoalsService;
exports.GoalsService = GoalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GoalsService);
//# sourceMappingURL=goals.service.js.map