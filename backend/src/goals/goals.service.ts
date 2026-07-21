import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

export interface GoalStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  totalTarget: string;
  totalSaved: string;
  completionRate: string;
}

@Injectable()
export class GoalsService {
    constructor(private prisma: PrismaService) { }

    async findAll(workspaceId: string) {
        return this.prisma.goal.findMany({
            where: { workspaceId, deletedAt: null },
            orderBy: [{ isCompleted: 'asc' }, { createdAt: 'desc' }],
        });
    }

    async findOne(workspaceId: string, id: string) {
        const goal = await this.prisma.goal.findFirst({
            where: { id, workspaceId, deletedAt: null },
        });
        if (!goal) throw new NotFoundException('Meta no encontrada');
        return goal;
    }

    async create(workspaceId: string, dto: any) {
        const targetDecimal = new Decimal(dto.targetAmount);
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
        } as any);
    }

    async update(workspaceId: string, id: string, dto: any) {
        const goal = await this.findOne(workspaceId, id);
        const data: any = {};
        if (dto.name !== undefined) data.name = dto.name;
        if (dto.description !== undefined) data.description = dto.description;
        if (dto.targetAmount !== undefined) data.targetAmount = new Decimal(dto.targetAmount);
        if (dto.category !== undefined) data.category = dto.category;
        if (dto.targetDate !== undefined) data.targetDate = dto.targetDate ? new Date(dto.targetDate) : null;
        if (dto.isCompleted !== undefined) data.isCompleted = dto.isCompleted;
        if (dto.isActive !== undefined) data.isActive = dto.isActive;

        return this.prisma.goal.update({
            where: { id: goal.id },
            data,
        });
    }

    async remove(workspaceId: string, id: string) {
        const goal = await this.findOne(workspaceId, id);
        return this.prisma.goal.update({
            where: { id: goal.id },
            data: { deletedAt: new Date() },
        });
    }

    async addToGoal(workspaceId: string, id: string, amount: number) {
        const goal = await this.findOne(workspaceId, id);
        const newCurrent = new Decimal(goal.currentAmount.toString()).add(new Decimal(amount));
        const target = new Decimal(goal.targetAmount.toString());
        const isCompleted = newCurrent.greaterThanOrEqualTo(target);

        return this.prisma.goal.update({
            where: { id: goal.id },
            data: {
                currentAmount: newCurrent,
                isCompleted,
            },
        });
    }

    async getStats(workspaceId: string): Promise<GoalStats> {
        const goals = await this.prisma.goal.findMany({
            where: { workspaceId },
        });

        const totalGoals = goals.length;
        const activeGoals = goals.filter((g) => g.isActive && !g.isCompleted).length;
        const completedGoals = goals.filter((g) => g.isCompleted).length;

        const totalTarget = goals.reduce((sum, g) => sum.add(new Decimal(g.targetAmount.toString())), new Decimal('0'));
        const totalSaved = goals.reduce((sum, g) => sum.add(new Decimal(g.currentAmount.toString())), new Decimal('0'));

        const completionRate = totalTarget.greaterThan(0)
            ? totalSaved.div(totalTarget).mul(100)
            : new Decimal('0');

        return {
            totalGoals,
            activeGoals,
            completedGoals,
            totalTarget: totalTarget.toFixed(2),
            totalSaved: totalSaved.toFixed(2),
            completionRate: completionRate.toFixed(2),
        };
    }
}
