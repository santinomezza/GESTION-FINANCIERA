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
exports.InvitationsService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
const prisma_service_1 = require("../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let InvitationsService = class InvitationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateCode() {
        return crypto.randomBytes(16).toString('hex').toUpperCase();
    }
    async create(workspaceId, data) {
        const code = data.code || this.generateCode();
        const expiresAt = data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        return this.prisma.invitation.create({
            data: {
                workspaceId,
                code,
                email: data.email,
                role: data.role || client_1.WorkspaceMemberRole.VIEWER,
                displayName: data.displayName,
                maxUses: data.maxUses || 1,
                expiresAt,
                createdBy: data.createdBy,
            },
        });
    }
    async findByCode(code) {
        const now = new Date();
        const invitations = await this.prisma.invitation.findMany({
            where: {
                code,
                expiresAt: { gte: now },
            },
            include: { workspace: true },
        });
        return invitations.find(inv => inv.maxUses === 0 || inv.usesCount < inv.maxUses) || null;
    }
    async useInvitation(code, userId) {
        const invitation = await this.findByCode(code);
        if (!invitation) {
            throw new common_1.BadRequestException('Invitación no válida o expirada');
        }
        if (invitation.workspace.userId === userId) {
            return { success: true, workspaceId: invitation.workspaceId, alreadyOwner: true };
        }
        const existingMember = await this.prisma.workspaceMember.findFirst({
            where: { workspaceId: invitation.workspaceId, userId },
        });
        if (existingMember && existingMember.deletedAt === null) {
            return { success: true, workspaceId: invitation.workspaceId, alreadyMember: true };
        }
        if (existingMember && existingMember.deletedAt !== null) {
            await this.prisma.workspaceMember.update({
                where: { id: existingMember.id },
                data: {
                    deletedAt: null,
                    isActive: true,
                    role: invitation.role,
                    displayName: invitation.displayName,
                    invitedBy: invitation.createdBy,
                    joinedAt: new Date(),
                }
            });
        }
        else {
            await this.prisma.workspaceMember.create({
                data: {
                    workspaceId: invitation.workspaceId,
                    userId,
                    role: invitation.role,
                    displayName: invitation.displayName,
                    invitedBy: invitation.createdBy,
                    joinedAt: new Date(),
                },
            });
        }
        await this.prisma.invitation.update({
            where: { id: invitation.id },
            data: {
                usesCount: { increment: 1 },
                usedAt: new Date(),
            },
        });
        return { success: true, workspaceId: invitation.workspaceId };
    }
    async findAll(workspaceId) {
        return this.prisma.invitation.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async update(id, workspaceId, data) {
        const invitation = await this.prisma.invitation.findFirst({
            where: { id, workspaceId },
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Invitación no encontrada');
        }
        return this.prisma.invitation.update({
            where: { id },
            data: {
                ...(data.role !== undefined && { role: data.role }),
                ...(data.displayName !== undefined && { displayName: data.displayName }),
                ...(data.expiresAt !== undefined && { expiresAt: data.expiresAt }),
            },
        });
    }
    async delete(id, workspaceId) {
        const invitation = await this.prisma.invitation.findFirst({
            where: { id, workspaceId },
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Invitación no encontrada');
        }
        return this.prisma.invitation.delete({
            where: { id },
        });
    }
};
exports.InvitationsService = InvitationsService;
exports.InvitationsService = InvitationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvitationsService);
//# sourceMappingURL=invitations.service.js.map