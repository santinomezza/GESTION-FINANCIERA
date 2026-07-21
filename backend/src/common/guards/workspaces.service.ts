import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryType, WorkspaceType } from '@prisma/client';

@Injectable()
export class WorkspacesService {
  private readonly logger = new Logger(WorkspacesService.name);

  constructor(private prisma: PrismaService) {}

  async findAllForUser(userId: string) {
    const ownedWorkspaces = await this.prisma.workspace.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
    const memberWorkspaces = await this.prisma.workspaceMember.findMany({
      where: { userId, isActive: true, deletedAt: null },
      include: { workspace: true },
    });
    const ownedIds = new Set(ownedWorkspaces.map(w => w.id));
    const ownedWithRole = ownedWorkspaces.map(w => ({ ...w, memberRole: 'OWNER' as const }));
    const memberOnly = memberWorkspaces
      .filter(m => !ownedIds.has(m.workspaceId) && m.workspace.deletedAt === null)
      .map(m => ({ ...m.workspace, memberRole: m.role }));
    return [...ownedWithRole, ...memberOnly];
  }

  async findById(id: string, userId: string) {
    let workspace = await this.prisma.workspace.findFirst({ where: { id, userId } });
    if (!workspace) {
      const member = await this.prisma.workspaceMember.findFirst({
        where: { workspaceId: id, userId, isActive: true },
        include: { workspace: true },
      });
      if (member) workspace = member.workspace;
    }
    if (!workspace) throw new NotFoundException('Workspace no encontrado');
    return workspace;
  }

  async create(userId: string, dto: { name: string; type: WorkspaceType; description?: string }) {
    return this.prisma.workspace.create({
      data: {
        name: dto.name,
        type: dto.type,
        userId,
      },
    });
  }

  async createWithDefaults(userId: string, dto: { name: string; type: WorkspaceType; description?: string }) {
    const workspace = await this.create(userId, dto);
    if (dto.type === WorkspaceType.PERSONAL) await this.createPersonalDefaults(workspace.id);
    else await this.createBusinessDefaults(workspace.id);
    return workspace;
  }

  async update(id: string, userId: string, dto: { name?: string; enabledFeatures?: string[] }) {
    await this.findById(id, userId);
    return this.prisma.workspace.update({
      where: { id },
      data: { name: dto.name, enabledFeatures: dto.enabledFeatures },
    });
  }

  async remove(id: string, userId: string) {
    await this.findById(id, userId);
    await this.prisma.workspace.delete({ where: { id } });
    this.logger.log(`Workspace ${id} eliminado`);
  }

  private async createPersonalDefaults(workspaceId: string) {
    const defaults = [
      { name: 'Ventas', icon: 'trending-up', color: '#22c55e', type: CategoryType.INCOME, sortOrder: 1 },
      { name: 'Cobros', icon: 'dollar-sign', color: '#16a34a', type: CategoryType.INCOME, sortOrder: 2 },
      { name: 'Stock', icon: 'package', color: '#3b82f6', type: CategoryType.EXPENSE, sortOrder: 3 },
      { name: 'Nafta', icon: 'fuel', color: '#f59e0b', type: CategoryType.EXPENSE, sortOrder: 4 },
      { name: 'Sueldos', icon: 'users', color: '#8b5cf6', type: CategoryType.EXPENSE, sortOrder: 5 },
      { name: 'Servicios', icon: 'zap', color: '#06b6d4', type: CategoryType.EXPENSE, sortOrder: 6 },
      { name: 'Impuestos', icon: 'file-text', color: '#ef4444', type: CategoryType.EXPENSE, sortOrder: 7 },
      { name: 'Gastos Varios', icon: 'tag', color: '#6b7280', type: CategoryType.EXPENSE, sortOrder: 8 },
      { name: 'Clientes', icon: 'briefcase', color: '#385144', type: CategoryType.MIXED, sortOrder: 9 },
    ];
    await this.prisma.category.createMany({ data: defaults.map(c => ({ ...c, workspaceId })), skipDuplicates: true });
    this.logger.log(`Categorías por defecto (personal) creadas para workspace ${workspaceId}`);
  }

  private async createBusinessDefaults(workspaceId: string) {
    const defaults = [
      { name: 'Ventas', icon: 'trending-up', color: '#22c55e', type: CategoryType.INCOME, sortOrder: 1 },
      { name: 'Cobros', icon: 'dollar-sign', color: '#16a34a', type: CategoryType.INCOME, sortOrder: 2 },
      { name: 'Facturación', icon: 'file-text', color: '#3b82f6', type: CategoryType.INCOME, sortOrder: 3 },
      { name: 'Stock', icon: 'package', color: '#f59e0b', type: CategoryType.EXPENSE, sortOrder: 4 },
      { name: 'Alquiler', icon: 'home', color: '#ef4444', type: CategoryType.EXPENSE, sortOrder: 5 },
      { name: 'Sueldos', icon: 'users', color: '#8b5cf6', type: CategoryType.EXPENSE, sortOrder: 6 },
      { name: 'Servicios', icon: 'zap', color: '#06b6d4', type: CategoryType.EXPENSE, sortOrder: 7 },
      { name: 'Impuestos', icon: 'percent', color: '#ec4899', type: CategoryType.EXPENSE, sortOrder: 8 },
      { name: 'Gastos Varios', icon: 'tag', color: '#6b7280', type: CategoryType.EXPENSE, sortOrder: 9 },
    ];
    await this.prisma.category.createMany({ data: defaults.map(c => ({ ...c, workspaceId })), skipDuplicates: true });
    this.logger.log(`Categorías por defecto (empresarial) creadas para workspace ${workspaceId}`);
  }
}
