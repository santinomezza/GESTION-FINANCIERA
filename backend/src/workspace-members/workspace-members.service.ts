import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { WorkspaceMemberRole } from '@prisma/client';

@Injectable()
export class WorkspaceMembersService {
    constructor(private prisma: PrismaService) { }

    async findAll(workspaceId: string) {
        return this.prisma.workspaceMember.findMany({
            where: { workspaceId, deletedAt: null, isActive: true },
            include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
            orderBy: { role: 'asc' },
        });
    }

    async findOne(id: string, workspaceId: string) {
        return this.prisma.workspaceMember.findFirst({
            where: { id, workspaceId, deletedAt: null },
            include: { user: true },
        });
    }

    async invite(workspaceId: string, data: {
        userId: string;
        role?: WorkspaceMemberRole;
        displayName?: string;
        invitedBy: string;
    }) {
        const existing = await this.prisma.workspaceMember.findFirst({
            where: { workspaceId, userId: data.userId },
        });

        if (existing && existing.deletedAt === null) {
            throw new BadRequestException('El usuario ya es miembro de este workspace');
        }

        if (existing && existing.deletedAt !== null) {
            return this.prisma.workspaceMember.update({
                where: { id: existing.id },
                data: {
                    deletedAt: null,
                    isActive: true,
                    role: data.role || WorkspaceMemberRole.VIEWER,
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
                role: data.role || WorkspaceMemberRole.VIEWER,
                displayName: data.displayName,
                invitedBy: data.invitedBy,
                joinedAt: new Date(),
            },
            include: { user: true },
        });
    }

    async updateRole(id: string, workspaceId: string, role: WorkspaceMemberRole, displayName?: string) {
        const member = await this.prisma.workspaceMember.findFirst({
            where: { id, workspaceId, deletedAt: null },
        });

        if (!member) {
            throw new NotFoundException('Miembro no encontrado');
        }

        return this.prisma.workspaceMember.update({
            where: { id },
            data: { role, ...(displayName !== undefined && { displayName }) },
            include: { user: true },
        });
    }

    async remove(id: string, workspaceId: string) {
        const member = await this.prisma.workspaceMember.findFirst({
            where: { id, workspaceId, deletedAt: null },
        });

        if (!member) {
            throw new NotFoundException('Miembro no encontrado');
        }

        return this.prisma.workspaceMember.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
    }

    async checkPermission(workspaceId: string, userId: string, requiredRole: WorkspaceMemberRole): Promise<boolean> {
        const member = await this.prisma.workspaceMember.findFirst({
            where: { workspaceId, userId, deletedAt: null, isActive: true },
        });

        if (!member) return false;

        const roleHierarchy: Record<WorkspaceMemberRole, number> = {
            OWNER: 5,
            ADMIN: 4,
            ACCOUNTANT: 3,
            PARTNER: 2,
            VIEWER: 1,
        };

        return roleHierarchy[member.role] >= roleHierarchy[requiredRole];
    }

    async getWorkspaceOwner(workspaceId: string) {
        return this.prisma.workspaceMember.findFirst({
            where: { workspaceId, role: WorkspaceMemberRole.OWNER, deletedAt: null, isActive: true },
            include: { user: true },
        });
    }
}