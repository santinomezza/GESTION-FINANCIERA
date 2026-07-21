import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkspaceGuard implements CanActivate {
    constructor(private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const workspaceId = request.headers['x-workspace-id'];

        if (!user?.sub) {
            throw new UnauthorizedException();
        }

        if (!workspaceId) {
            throw new ForbiddenException('Se requiere la cabecera x-workspace-id');
        }

        // 1. Check if user is owner of the workspace
        const workspace = await this.prisma.workspace.findFirst({
            where: { id: workspaceId, userId: user.sub, deletedAt: null },
        });

        let role: string | null = null;

        if (workspace) {
            role = 'OWNER';
        } else {
            // 2. Check if user is a member in WorkspaceMember
            const member = await this.prisma.workspaceMember.findFirst({
                where: {
                    workspaceId,
                    userId: user.sub,
                    deletedAt: null,
                    isActive: true,
                },
            });
            if (member) {
                role = member.role;
            }
        }

        if (!role) {
            throw new ForbiddenException('Acceso denegado a este workspace');
        }

        // Attach workspaceId and user's workspaceRole to the request
        request.workspaceId = workspaceId;
        request.user = {
            ...request.user,
            workspaceRole: role,
        };

        return true;
    }
}