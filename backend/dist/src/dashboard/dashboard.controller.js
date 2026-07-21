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
exports.DashboardController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("./dashboard.service");
const swagger_1 = require("@nestjs/swagger");
const workspace_decorator_1 = require("../common/decorators/workspace.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const workspace_guard_1 = require("../common/guards/workspace.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    getOverview(workspaceId, year) {
        return this.dashboardService.getOverview(workspaceId, year ? +year : undefined);
    }
    getExpensesDashboard(workspaceId, months) {
        return this.dashboardService.getExpensesDashboard(workspaceId, months ? +months : 6);
    }
    getIncomeDashboard(workspaceId, months) {
        return this.dashboardService.getIncomeDashboard(workspaceId, months ? +months : 6);
    }
    getProfitabilityDashboard(workspaceId, months) {
        return this.dashboardService.getProfitabilityDashboard(workspaceId, months ? +months : 12);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('overview'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('expenses'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(1, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getExpensesDashboard", null);
__decorate([
    (0, common_1.Get)('income'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(1, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getIncomeDashboard", null);
__decorate([
    (0, common_1.Get)('profitability'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(1, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getProfitabilityDashboard", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('Dashboard'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, workspace_guard_1.WorkspaceGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiHeader)({
        name: 'x-workspace-id',
        description: 'ID del workspace activo',
        required: true,
    }),
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map