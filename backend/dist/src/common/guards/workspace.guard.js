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
exports.WorkspaceGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WorkspaceGuard = class WorkspaceGuard {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const workspaceId = request.headers['x-workspace-id'];
        if (!user?.sub) {
            throw new common_1.UnauthorizedException();
        }
        if (!workspaceId) {
            throw new common_1.ForbiddenException('Se requiere la cabecera x-workspace-id');
        }
        const workspace = await this.prisma.workspace.findFirst({
            where: { id: workspaceId, userId: user.sub, deletedAt: null },
        });
        let role = null;
        if (workspace) {
            role = 'OWNER';
        }
        else {
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
            throw new common_1.ForbiddenException('Acceso denegado a este workspace');
        }
        request.workspaceId = workspaceId;
        request.user = {
            ...request.user,
            workspaceRole: role,
        };
        return true;
    }
};
exports.WorkspaceGuard = WorkspaceGuard;
exports.WorkspaceGuard = WorkspaceGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkspaceGuard);
//# sourceMappingURL=workspace.guard.js.map