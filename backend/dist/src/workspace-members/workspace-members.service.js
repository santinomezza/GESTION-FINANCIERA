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
exports.WorkspaceMembersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let WorkspaceMembersService = class WorkspaceMembersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(workspaceId) {
        return this.prisma.workspaceMember.findMany({
            where: { workspaceId, deletedAt: null, isActive: true },
            include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
            orderBy: { role: 'asc' },
        });
    }
    async findOne(id, workspaceId) {
        return this.prisma.workspaceMember.findFirst({
            where: { id, workspaceId, deletedAt: null },
            include: { user: true },
        });
    }
    async invite(workspaceId, data) {
        const existing = await this.prisma.workspaceMember.findFirst({
            where: { workspaceId, userId: data.userId },
        });
        if (existing && existing.deletedAt === null) {
            throw new common_1.BadRequestException('El usuario ya es miembro de este workspace');
        }
        if (existing && existing.deletedAt !== null) {
            return this.prisma.workspaceMember.update({
                where: { id: existing.id },
                data: {
                    deletedAt: null,
                    isActive: true,
                    role: data.role || client_1.WorkspaceMemberRole.VIEWER,
                    displayName: data.displayName,
                    invitedBy: data.invitedBy,
                    joinedAt: new Date(),
                },
                include: { user: true },
            });
        }
        return this.prisma.workspaceMember.create({
            data: {
                workspaceId,
                userId: data.userId,
                role: data.role || client_1.WorkspaceMemberRole.VIEWER,
                displayName: data.displayName,
                invitedBy: data.invitedBy,
                joinedAt: new Date(),
            },
            include: { user: true },
        });
    }
    async updateRole(id, workspaceId, role, displayName) {
        const member = await this.prisma.workspaceMember.findFirst({
            where: { id, workspaceId, deletedAt: null },
        });
        if (!member) {
            throw new common_1.NotFoundException('Miembro no encontrado');
        }
        return this.prisma.workspaceMember.update({
            where: { id },
            data: { role, ...(displayName !== undefined && { displayName }) },
            include: { user: true },
        });
    }
    async remove(id, workspaceId) {
        const member = await this.prisma.workspaceMember.findFirst({
            where: { id, workspaceId, deletedAt: null },
        });
        if (!member) {
            throw new common_1.NotFoundException('Miembro no encontrado');
        }
        return this.prisma.workspaceMember.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
    }
    async checkPermission(workspaceId, userId, requiredRole) {
        const member = await this.prisma.workspaceMember.findFirst({
            where: { workspaceId, userId, deletedAt: null, isActive: true },
        });
        if (!member)
            return false;
        const roleHierarchy = {
            OWNER: 5,
            ADMIN: 4,
            ACCOUNTANT: 3,
            PARTNER: 2,
            VIEWER: 1,
        };
        return roleHierarchy[member.role] >= roleHierarchy[requiredRole];
    }
    async getWorkspaceOwner(workspaceId) {
        return this.prisma.workspaceMember.findFirst({
            where: { workspaceId, role: client_1.WorkspaceMemberRole.OWNER, deletedAt: null, isActive: true },
            include: { user: true },
        });
    }
};
exports.WorkspaceMembersService = WorkspaceMembersService;
exports.WorkspaceMembersService = WorkspaceMembersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkspaceMembersService);
//# sourceMappingURL=workspace-members.service.js.map