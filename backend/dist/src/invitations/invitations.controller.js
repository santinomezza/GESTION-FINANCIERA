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
exports.InvitationsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const invitations_service_1 = require("./invitations.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const workspace_guard_1 = require("../common/guards/workspace.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let InvitationsController = class InvitationsController {
    constructor(service) {
        this.service = service;
    }
    findAll(req) {
        return this.service.findAll(req.workspaceId);
    }
    create(req, data) {
        return this.service.create(req.workspaceId, {
            ...data,
            createdBy: req.user.id,
        });
    }
    useInvitation(req, data) {
        return this.service.useInvitation(data.code, req.user.id);
    }
    delete(req, id) {
        return this.service.delete(id, req.workspaceId);
    }
    update(id, req, data) {
        const updateData = {};
        if (data.role !== undefined)
            updateData.role = data.role;
        if (data.displayName !== undefined)
            updateData.displayName = data.displayName;
        if (data.expiresAt !== undefined)
            updateData.expiresAt = new Date(data.expiresAt);
        return this.service.update(id, req.workspaceId, updateData);
    }
};
exports.InvitationsController = InvitationsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(workspace_guard_1.WorkspaceGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.OWNER, client_1.WorkspaceMemberRole.ADMIN),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InvitationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(workspace_guard_1.WorkspaceGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.OWNER, client_1.WorkspaceMemberRole.ADMIN),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], InvitationsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('use'),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], InvitationsController.prototype, "useInvitation", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(workspace_guard_1.WorkspaceGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.OWNER, client_1.WorkspaceMemberRole.ADMIN),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InvitationsController.prototype, "delete", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(workspace_guard_1.WorkspaceGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.OWNER, client_1.WorkspaceMemberRole.ADMIN),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], InvitationsController.prototype, "update", null);
exports.InvitationsController = InvitationsController = __decorate([
    (0, common_1.Controller)('invitations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [invitations_service_1.InvitationsService])
], InvitationsController);
//# sourceMappingURL=invitations.controller.js.map