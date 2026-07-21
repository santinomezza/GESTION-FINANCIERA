import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { WorkspaceMemberRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<WorkspaceMemberRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user || !user.workspaceRole) {
            return false;
        }

        const roleHierarchy: Record<WorkspaceMemberRole, number> = {
            OWNER: 5,
            ADMIN: 4,
            ACCOUNTANT: 3,
            PARTNER: 2,
            VIEWER: 1,
        };

        const userRoleLevel = roleHierarchy[user.workspaceRole];
        return requiredRoles.some(role => roleHierarchy[role] <= userRoleLevel);
    }
}