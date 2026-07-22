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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const invoices_service_1 = require("./invoices.service");
const create_invoice_dto_1 = require("./create-invoice.dto");
const update_invoice_dto_1 = require("./update-invoice.dto");
const workspace_decorator_1 = require("./common/decorators/workspace.decorator");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const workspace_guard_1 = require("./common/guards/workspace.guard");
const roles_decorator_1 = require("./common/decorators/roles.decorator");
const roles_guard_1 = require("./common/guards/roles.guard");
const business_workspace_guard_1 = require("./common/guards/business-workspace.guard");
const mark_invoice_paid_dto_1 = require("./mark-invoice-paid.dto");
const platform_express_1 = require("@nestjs/platform-express");
const clients_service_1 = require("./clients/clients.service");
const client_1 = require("@prisma/client");
const path_1 = require("path");
const fs_1 = require("fs");
const config_1 = require("@nestjs/config");
let InvoicesController = class InvoicesController {
    constructor(invoicesService, clientsService, config) {
        this.invoicesService = invoicesService;
        this.clientsService = clientsService;
        this.config = config;
    }
    create(workspaceId, createInvoiceDto) {
        return this.invoicesService.create(workspaceId, createInvoiceDto);
    }
    findAll(workspaceId, clientId) {
        return this.invoicesService.findAll(workspaceId, clientId);
    }
    findOne(workspaceId, id) {
        return this.invoicesService.findOne(workspaceId, id);
    }
    async getInvoiceFile(workspaceId, id, res) {
        const invoice = await this.invoicesService.findOne(workspaceId, id);
        if (invoice.file) {
            res.setHeader('Content-Type', invoice.fileMimeType || 'application/octet-stream');
            res.setHeader('Content-Disposition', `inline; filename="${invoice.invoiceNumber}.${(invoice.fileMimeType || '').split('/')[1] || 'bin'}"`);
            res.send(invoice.file);
            return;
        }
        if (invoice.urlArchivo) {
            const filePath = (0, path_1.join)(this.config.get('uploadsDir'), 'invoices', invoice.urlArchivo.replace('/invoices/', ''));
            if (!(0, fs_1.existsSync)(filePath)) {
                throw new Error('Archivo no encontrado');
            }
            const { readFileSync } = require('fs');
            const file = readFileSync(filePath);
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', `inline; filename="${invoice.invoiceNumber}"`);
            res.send(file);
            return;
        }
        throw new Error('Archivo no encontrado');
    }
    update(workspaceId, id, updateInvoiceDto) {
        return this.invoicesService.update(workspaceId, id, updateInvoiceDto);
    }
    remove(workspaceId, id) {
        return this.invoicesService.remove(workspaceId, id);
    }
    markAsPaid(workspaceId, id, markAsPaidDto) {
        return this.invoicesService.markAsPaid(workspaceId, id, markAsPaidDto.paymentDate);
    }
    async uploadInvoice(workspaceId, file) {
        if (!file) {
            throw new Error('Archivo requerido');
        }
        const extracted = await this.invoicesService.extractInvoiceData(file.buffer, file.mimetype);
        let clientId;
        if (extracted.cliente || extracted.razonSocial || extracted.cuit) {
            const clientName = extracted.razonSocial || extracted.cliente;
            if (clientName) {
                const existingClients = await this.clientsService.findAll(workspaceId);
                const existingClient = existingClients.find((c) => c.cuit === extracted.cuit || c.name.toLowerCase() === clientName.toLowerCase());
                if (existingClient) {
                    clientId = existingClient.id;
                }
                else {
                    const newClient = await this.clientsService.create(workspaceId, {
                        name: clientName,
                        cuit: extracted.cuit || undefined,
                    });
                    clientId = newClient.id;
                }
            }
        }
        const issueDate = extracted.fecha ? new Date(extracted.fecha + 'T00:00:00Z') : new Date();
        const dueDate = new Date(issueDate);
        dueDate.setDate(dueDate.getDate() + 30);
        const invoiceNumber = extracted.numeroTicket || `IMP-${Date.now()}`;
        const invoice = await this.invoicesService.create(workspaceId, {
            invoiceNumber,
            issueDate,
            dueDate,
            totalAmount: extracted.total,
            status: 'PENDING',
            clientId: clientId || '',
            file: file.buffer,
            fileMimeType: file.mimetype,
        });
        return { invoice, extracted, fileUrl: `/api/invoices/${invoice.id}/file` };
    }
    async uploadInvoiceFile(workspaceId, id, file) {
        await this.invoicesService.update(workspaceId, id, {
            file: file.buffer,
            fileMimeType: file.mimetype,
        });
        return { fileUrl: `/api/invoices/${id}/file` };
    }
};
exports.InvoicesController = InvoicesController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.ADMIN),
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_invoice_dto_1.CreateInvoiceDto]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(1, (0, common_1.Query)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/file'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener el archivo de una factura' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "getInvoiceFile", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.ADMIN),
    (0, common_1.Patch)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_invoice_dto_1.UpdateInvoiceDto]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.ADMIN),
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "remove", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.ADMIN),
    (0, common_1.Post)(':id/pay'),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar una factura como pagada y crear la transacción de ingreso correspondiente.' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, mark_invoice_paid_dto_1.MarkInvoicePaidDto]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "markAsPaid", null);
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
], InvoicesController.prototype, "uploadInvoice", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.ADMIN),
    (0, common_1.Post)(':id/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Subir archivo a una factura existente' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, typeof (_b = typeof common_1.UploadedFile !== "undefined" && common_1.UploadedFile) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "uploadInvoiceFile", null);
exports.InvoicesController = InvoicesController = __decorate([
    (0, swagger_1.ApiTags)('Invoices'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, workspace_guard_1.WorkspaceGuard, business_workspace_guard_1.BusinessWorkspaceGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiHeader)({
        name: 'x-workspace-id',
        description: 'ID del workspace activo',
        required: true,
    }),
    (0, common_1.Controller)('invoices'),
    __metadata("design:paramtypes", [invoices_service_1.InvoicesService,
        clients_service_1.ClientsService,
        config_1.ConfigService])
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map