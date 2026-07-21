import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../common/prisma/prisma.service';
import { WorkspaceMemberRole } from '@prisma/client';

@Injectable()
export class InvitationsService {
    constructor(private prisma: PrismaService) { }

    private generateCode(): string {
        return crypto.randomBytes(16).toString('hex').toUpperCase();
    }

    async create(workspaceId: string, data: {
        code?: string;
        email?: string;
        role?: WorkspaceMemberRole;
        displayName?: string;
        maxUses?: number;
        expiresAt?: Date;
        createdBy: string;
    }) {
        const code = data.code || this.generateCode();
        const expiresAt = data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días por defecto

        return this.prisma.invitation.create({
            data: {
                workspaceId,
                code,
                email: data.email,
                role: data.role || WorkspaceMemberRole.VIEWER,
                displayName: data.displayName,
                maxUses: data.maxUses || 1,
                expiresAt,
                createdBy: data.createdBy,
            },
        });
    }

    async findByCode(code: string) {
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

    async useInvitation(code: string, userId: string) {
        const invitation = await this.findByCode(code);

        if (!invitation) {
            throw new BadRequestException('Invitación no válida o expirada');
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
        } else {
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

    async findAll(workspaceId: string) {
        return this.prisma.invitation.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async update(id: string, workspaceId: string, data: {
        role?: WorkspaceMemberRole;
        displayName?: string;
        expiresAt?: Date;
    }) {
        const invitation = await this.prisma.invitation.findFirst({
            where: { id, workspaceId },
        });

        if (!invitation) {
            throw new NotFoundException('Invitación no encontrada');
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

    async delete(id: string, workspaceId: string) {
        const invitation = await this.prisma.invitation.findFirst({
            where: { id, workspaceId },
        });

        if (!invitation) {
            throw new NotFoundException('Invitación no encontrada');
        }

        return this.prisma.invitation.delete({
            where: { id },
        });
    }
}