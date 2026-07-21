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
exports.AIRecommendationsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const ai_recommendations_service_1 = require("./ai-recommendations.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const workspace_guard_1 = require("../common/guards/workspace.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const client_1 = require("@prisma/client");
let AIRecommendationsController = class AIRecommendationsController {
    constructor(service) {
        this.service = service;
    }
    findAll(req) {
        return this.service.findAll(req.user.id, req.workspaceId);
    }
    getPending(req) {
        return this.service.getPendingRecommendations(req.user.id, req.workspaceId);
    }
    generate(req) {
        return this.service.generateRecommendations(req.user.id, req.workspaceId);
    }
    markAsRead(id, req) {
        return this.service.markAsRead(id, req.user.id);
    }
    dismiss(id, req) {
        return this.service.dismiss(id, req.user.id);
    }
};
exports.AIRecommendationsController = AIRecommendationsController;
__decorate([
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AIRecommendationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('pending'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AIRecommendationsController.prototype, "getPending", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.ADMIN),
    (0, common_1.Post)('generate'),
    openapi.ApiResponse({ status: 201, type: [Object] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AIRecommendationsController.prototype, "generate", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.ADMIN),
    (0, common_1.Patch)(':id/read'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AIRecommendationsController.prototype, "markAsRead", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.ADMIN),
    (0, common_1.Patch)(':id/dismiss'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AIRecommendationsController.prototype, "dismiss", null);
exports.AIRecommendationsController = AIRecommendationsController = __decorate([
    (0, common_1.Controller)('ai-recommendations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, workspace_guard_1.WorkspaceGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [ai_recommendations_service_1.AIRecommendationsService])
], AIRecommendationsController);
//# sourceMappingURL=ai-recommendations.controller.js.map