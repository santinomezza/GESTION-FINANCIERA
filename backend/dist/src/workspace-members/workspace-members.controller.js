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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceMembersController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const workspace_members_service_1 = require("./workspace-members.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const workspace_guard_1 = require("../common/guards/workspace.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let WorkspaceMembersController = class WorkspaceMembersController {
    constructor(service) {
        this.service = service;
    }
    findAll(req) {
        return this.service.findAll(req.workspaceId);
    }
    findOne(id, req) {
        return this.service.findOne(id, req.workspaceId);
    }
    invite(req, data) {
        return this.service.invite(req.workspaceId, {
            ...data,
            invitedBy: req.user.id,
        });
    }
    updateRole(id, req, data) {
        return this.service.updateRole(id, req.workspaceId, data.role, data.displayName);
    }
    remove(id, req) {
        return this.service.remove(id, req.workspaceId);
    }
};
exports.WorkspaceMembersController = WorkspaceMembersController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.OWNER, client_1.WorkspaceMemberRole.ADMIN, client_1.WorkspaceMemberRole.ACCOUNTANT, client_1.WorkspaceMemberRole.PARTNER, client_1.WorkspaceMemberRole.VIEWER),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkspaceMembersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.OWNER, client_1.WorkspaceMemberRole.ADMIN, client_1.WorkspaceMemberRole.ACCOUNTANT, client_1.WorkspaceMemberRole.PARTNER, client_1.WorkspaceMemberRole.VIEWER),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkspaceMembersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.OWNER, client_1.WorkspaceMemberRole.ADMIN),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WorkspaceMembersController.prototype, "invite", null);
__decorate([
    (0, common_1.Patch)(':id/role'),
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.OWNER, client_1.WorkspaceMemberRole.ADMIN),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], WorkspaceMembersController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.OWNER, client_1.WorkspaceMemberRole.ADMIN),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkspaceMembersController.prototype, "remove", null);
exports.WorkspaceMembersController = WorkspaceMembersController = __decorate([
    (0, common_1.Controller)('workspace-members'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, workspace_guard_1.WorkspaceGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [workspace_members_service_1.WorkspaceMembersService])
], WorkspaceMembersController);
//# sourceMappingURL=workspace-members.controller.js.map