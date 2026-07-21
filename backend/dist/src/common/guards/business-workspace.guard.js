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
exports.BusinessWorkspaceGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let BusinessWorkspaceGuard = class BusinessWorkspaceGuard {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const workspaceId = request.headers['x-workspace-id'];
        const workspace = await this.prisma.workspace.findFirst({
            where: { id: workspaceId },
        });
        if (!workspace) {
            throw new common_1.ForbiddenException('Workspace no encontrado');
        }
        if (workspace.type !== client_1.WorkspaceType.BUSINESS) {
            throw new common_1.ForbiddenException('Esta funcionalidad solo está disponible en workspaces de tipo Negocio');
        }
        return true;
    }
};
exports.BusinessWorkspaceGuard = BusinessWorkspaceGuard;
exports.BusinessWorkspaceGuard = BusinessWorkspaceGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BusinessWorkspaceGuard);
//# sourceMappingURL=business-workspace.guard.js.map