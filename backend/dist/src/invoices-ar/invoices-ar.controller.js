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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesArController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const invoices_ar_service_1 = require("./invoices-ar.service");
const create_manual_invoice_dto_1 = require("./dto/create-manual-invoice.dto");
const workspace_decorator_1 = require("../common/decorators/workspace.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const workspace_guard_1 = require("../common/guards/workspace.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const platform_express_1 = require("@nestjs/platform-express");
const client_1 = require("@prisma/client");
let InvoicesArController = class InvoicesArController {
    constructor(invoicesArService) {
        this.invoicesArService = invoicesArService;
    }
    async uploadInvoice(workspaceId, file) {
        if (!file) {
            throw new Error('Archivo requerido');
        }
        return await this.invoicesArService.processInvoiceOCR(workspaceId, file.buffer, file.originalname, file.mimetype);
    }
    createManual(workspaceId, dto) {
        return this.invoicesArService.createManual(workspaceId, dto);
    }
    findAll(workspaceId) {
        return this.invoicesArService.findAll(workspaceId);
    }
    findOne(workspaceId, id) {
        return this.invoicesArService.findOne(workspaceId, id);
    }
    updateEstado(workspaceId, id, estado) {
        return this.invoicesArService.updateEstado(workspaceId, id, estado);
    }
    remove(workspaceId, id) {
        return this.invoicesArService.remove(workspaceId, id);
    }
    async exportCSV(workspaceId, res) {
        const csvContent = await this.invoicesArService.exportCSV(workspaceId);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=facturas.csv');
        res.send(csvContent);
    }
};
exports.InvoicesArController = InvoicesArController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.ADMIN),
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Subir factura PDF/IMG y extraer datos con IA' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_a = typeof common_1.UploadedFile !== "undefined" && common_1.UploadedFile) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], InvoicesArController.prototype, "uploadInvoice", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.ADMIN),
    (0, common_1.Post)('manual'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear factura manualmente sin archivo' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_manual_invoice_dto_1.CreateManualInvoiceDto]),
    __metadata("design:returntype", void 0)
], InvoicesArController.prototype, "createManual", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar facturas del usuario' }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvoicesArController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener factura por ID' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InvoicesArController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.ADMIN),
    (0, common_1.Patch)(':id/estado'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar estado de pago' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('estado')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], InvoicesArController.prototype, "updateEstado", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.ADMIN),
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar factura' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InvoicesArController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('export/csv'),
    (0, swagger_1.ApiOperation)({ summary: 'Exportar facturas a CSV' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvoicesArController.prototype, "exportCSV", null);
exports.InvoicesArController = InvoicesArController = __decorate([
    (0, swagger_1.ApiTags)('Invoices AR'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, workspace_guard_1.WorkspaceGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiHeader)({
        name: 'x-workspace-id',
        description: 'ID del workspace activo',
        required: true,
    }),
    (0, common_1.Controller)('invoices-ar'),
    __metadata("design:paramtypes", [invoices_ar_service_1.InvoicesArService])
], InvoicesArController);
//# sourceMappingURL=invoices-ar.controller.js.map