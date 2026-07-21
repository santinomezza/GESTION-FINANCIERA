import { WorkspaceMemberRole } from '@prisma/client';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: WorkspaceMemberRole[]) => import("@nestjs/common").CustomDecorator<string>;
