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
var ReportsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reports_service_1 = require("./reports.service");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const workspace_decorator_1 = require("../common/decorators/workspace.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const workspace_guard_1 = require("../common/guards/workspace.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const date_fns_1 = require("date-fns");
let ReportsController = ReportsController_1 = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
        this.logger = new common_1.Logger(ReportsController_1.name);
    }
    async exportCSV(userId, workspaceId, filters, res) {
        try {
            const csv = await this.reportsService.generateCSV(userId, workspaceId, filters);
            const filename = `gestionar2_${(0, date_fns_1.format)(new Date(), 'yyyyMMdd')}.csv`;
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send('\uFEFF' + csv);
        }
        catch (err) {
            this.logger.error('Error exportando CSV:', err);
            res.status(500).json({ message: err.message || 'Error al exportar CSV' });
        }
    }
    async exportExcel(userId, workspaceId, filters, res) {
        try {
            const buffer = await this.reportsService.generateExcel(userId, workspaceId, filters);
            const filename = `gestionar2_${(0, date_fns_1.format)(new Date(), 'yyyyMMdd')}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(buffer);
        }
        catch (err) {
            this.logger.error('Error exportando Excel:', err);
            res.status(500).json({ message: err.message || 'Error al exportar Excel' });
        }
    }
    async exportInvoicesExcel(userId, workspaceId, filters, res) {
        try {
            const buffer = await this.reportsService.generateInvoicesExcel(userId, workspaceId, filters);
            const filename = `facturas_${(0, date_fns_1.format)(new Date(), 'yyyyMMdd')}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(buffer);
        }
        catch (err) {
            this.logger.error('Error exportando facturas Excel:', err);
            res.status(500).json({ message: err.message || 'Error al exportar facturas' });
        }
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('export/csv'),
    (0, swagger_1.ApiOperation)({ summary: 'Exportar movimientos a CSV' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(2, (0, common_1.Query)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportCSV", null);
__decorate([
    (0, common_1.Get)('export/excel'),
    (0, swagger_1.ApiOperation)({ summary: 'Exportar movimientos a Excel' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(2, (0, common_1.Query)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportExcel", null);
__decorate([
    (0, common_1.Get)('export/invoices/excel'),
    (0, swagger_1.ApiOperation)({ summary: 'Exportar facturas a Excel con URLs de archivos' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(2, (0, common_1.Query)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportInvoicesExcel", null);
exports.ReportsController = ReportsController = ReportsController_1 = __decorate([
    (0, swagger_1.ApiTags)('Reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, workspace_guard_1.WorkspaceGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiHeader)({
        name: 'x-workspace-id',
        description: 'ID del workspace activo',
        required: true,
    }),
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map