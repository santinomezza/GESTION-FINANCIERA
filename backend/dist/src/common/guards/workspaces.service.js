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
var WorkspacesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspacesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let WorkspacesService = WorkspacesService_1 = class WorkspacesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(WorkspacesService_1.name);
    }
    async findAllForUser(userId) {
        const ownedWorkspaces = await this.prisma.workspace.findMany({
            where: { userId, deletedAt: null },
            orderBy: { createdAt: 'asc' },
        });
        const memberWorkspaces = await this.prisma.workspaceMember.findMany({
            where: { userId, isActive: true, deletedAt: null },
            include: { workspace: true },
        });
        const ownedIds = new Set(ownedWorkspaces.map(w => w.id));
        const ownedWithRole = ownedWorkspaces.map(w => ({ ...w, memberRole: 'OWNER' }));
        const memberOnly = memberWorkspaces
            .filter(m => !ownedIds.has(m.workspaceId) && m.workspace.deletedAt === null)
            .map(m => ({ ...m.workspace, memberRole: m.role }));
        return [...ownedWithRole, ...memberOnly];
    }
    async findById(id, userId) {
        let workspace = await this.prisma.workspace.findFirst({ where: { id, userId } });
        if (!workspace) {
            const member = await this.prisma.workspaceMember.findFirst({
                where: { workspaceId: id, userId, isActive: true },
                include: { workspace: true },
            });
            if (member)
                workspace = member.workspace;
        }
        if (!workspace)
            throw new common_1.NotFoundException('Workspace no encontrado');
        return workspace;
    }
    async create(userId, dto) {
        return this.prisma.workspace.create({
            data: {
                name: dto.name,
                type: dto.type,
                userId,
            },
        });
    }
    async createWithDefaults(userId, dto) {
        const workspace = await this.create(userId, dto);
        if (dto.type === client_1.WorkspaceType.PERSONAL)
            await this.createPersonalDefaults(workspace.id);
        else
            await this.createBusinessDefaults(workspace.id);
        return workspace;
    }
    async update(id, userId, dto) {
        await this.findById(id, userId);
        return this.prisma.workspace.update({
            where: { id },
            data: { name: dto.name, enabledFeatures: dto.enabledFeatures },
        });
    }
    async remove(id, userId) {
        await this.findById(id, userId);
        await this.prisma.workspace.delete({ where: { id } });
        this.logger.log(`Workspace ${id} eliminado`);
    }
    async createPersonalDefaults(workspaceId) {
        const defaults = [
            { name: 'Ventas', icon: 'trending-up', color: '#22c55e', type: client_1.CategoryType.INCOME, sortOrder: 1 },
            { name: 'Cobros', icon: 'dollar-sign', color: '#16a34a', type: client_1.CategoryType.INCOME, sortOrder: 2 },
            { name: 'Stock', icon: 'package', color: '#3b82f6', type: client_1.CategoryType.EXPENSE, sortOrder: 3 },
            { name: 'Nafta', icon: 'fuel', color: '#f59e0b', type: client_1.CategoryType.EXPENSE, sortOrder: 4 },
            { name: 'Sueldos', icon: 'users', color: '#8b5cf6', type: client_1.CategoryType.EXPENSE, sortOrder: 5 },
            { name: 'Servicios', icon: 'zap', color: '#06b6d4', type: client_1.CategoryType.EXPENSE, sortOrder: 6 },
            { name: 'Impuestos', icon: 'file-text', color: '#ef4444', type: client_1.CategoryType.EXPENSE, sortOrder: 7 },
            { name: 'Gastos Varios', icon: 'tag', color: '#6b7280', type: client_1.CategoryType.EXPENSE, sortOrder: 8 },
            { name: 'Clientes', icon: 'briefcase', color: '#385144', type: client_1.CategoryType.MIXED, sortOrder: 9 },
        ];
        await this.prisma.category.createMany({ data: defaults.map(c => ({ ...c, workspaceId })), skipDuplicates: true });
        this.logger.log(`Categorías por defecto (personal) creadas para workspace ${workspaceId}`);
    }
    async createBusinessDefaults(workspaceId) {
        const defaults = [
            { name: 'Ventas', icon: 'trending-up', color: '#22c55e', type: client_1.CategoryType.INCOME, sortOrder: 1 },
            { name: 'Cobros', icon: 'dollar-sign', color: '#16a34a', type: client_1.CategoryType.INCOME, sortOrder: 2 },
            { name: 'Facturación', icon: 'file-text', color: '#3b82f6', type: client_1.CategoryType.INCOME, sortOrder: 3 },
            { name: 'Stock', icon: 'package', color: '#f59e0b', type: client_1.CategoryType.EXPENSE, sortOrder: 4 },
            { name: 'Alquiler', icon: 'home', color: '#ef4444', type: client_1.CategoryType.EXPENSE, sortOrder: 5 },
            { name: 'Sueldos', icon: 'users', color: '#8b5cf6', type: client_1.CategoryType.EXPENSE, sortOrder: 6 },
            { name: 'Servicios', icon: 'zap', color: '#06b6d4', type: client_1.CategoryType.EXPENSE, sortOrder: 7 },
            { name: 'Impuestos', icon: 'percent', color: '#ec4899', type: client_1.CategoryType.EXPENSE, sortOrder: 8 },
            { name: 'Gastos Varios', icon: 'tag', color: '#6b7280', type: client_1.CategoryType.EXPENSE, sortOrder: 9 },
        ];
        await this.prisma.category.createMany({ data: defaults.map(c => ({ ...c, workspaceId })), skipDuplicates: true });
        this.logger.log(`Categorías por defecto (empresarial) creadas para workspace ${workspaceId}`);
    }
};
exports.WorkspacesService = WorkspacesService;
exports.WorkspacesService = WorkspacesService = WorkspacesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkspacesService);
//# sourceMappingURL=workspaces.service.js.map