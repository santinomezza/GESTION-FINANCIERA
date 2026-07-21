import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const ActiveWorkspaceId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const workspaceId = request.headers['x-workspace-id'];

        if (!workspaceId) {
            throw new BadRequestException('La cabecera X-Workspace-Id es requerida.');
        }

        return workspaceId;
    },
);