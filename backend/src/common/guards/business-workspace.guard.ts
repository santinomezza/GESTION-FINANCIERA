import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspaceType } from '@prisma/client';

@Injectable()
export class BusinessWorkspaceGuard implements CanActivate {
    constructor(private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const workspaceId = request.headers['x-workspace-id'];

        const workspace = await this.prisma.workspace.findFirst({
            where: { id: workspaceId },
        });

        if (!workspace) {
            throw new ForbiddenException('Workspace no encontrado');
        }

        if (workspace.type !== WorkspaceType.BUSINESS) {
            throw new ForbiddenException('Esta funcionalidad solo está disponible en workspaces de tipo Negocio');
        }

        return true;
    }
}