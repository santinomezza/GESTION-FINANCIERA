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
exports.TransactionsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const transactions_service_1 = require("./transactions.service");
const create_transaction_dto_1 = require("./dto/create-transaction.dto");
const update_transaction_dto_1 = require("./dto/update-transaction.dto");
const filter_transactions_dto_1 = require("./dto/filter-transactions.dto");
const swagger_1 = require("@nestjs/swagger");
const workspace_decorator_1 = require("../common/decorators/workspace.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const workspace_guard_1 = require("../common/guards/workspace.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let TransactionsController = class TransactionsController {
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    create(workspaceId, req, createTransactionDto) {
        return this.transactionsService.create(workspaceId, createTransactionDto, req.user.sub);
    }
    findAll(workspaceId, filterDto) {
        return this.transactionsService.findAll(workspaceId, filterDto);
    }
    findOne(workspaceId, id) {
        return this.transactionsService.findOne(workspaceId, id);
    }
    update(workspaceId, id, updateTransactionDto) {
        return this.transactionsService.update(workspaceId, id, updateTransactionDto);
    }
    remove(workspaceId, id) {
        return this.transactionsService.remove(workspaceId, id);
    }
    duplicate(workspaceId, id, req) {
        return this.transactionsService.duplicate(workspaceId, id, req.user.sub);
    }
    checkLimit(workspaceId, data) {
        return this.transactionsService.checkCategoryLimit(workspaceId, data.categoryId, data.amount);
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.ADMIN),
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_transaction_dto_1.CreateTransactionDto]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, filter_transactions_dto_1.FilterTransactionsDto]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.ADMIN),
    (0, common_1.Patch)(':id'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_transaction_dto_1.UpdateTransactionDto]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.ADMIN),
    (0, common_1.Delete)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "remove", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.ADMIN),
    (0, common_1.Post)(':id/duplicate'),
    (0, swagger_1.ApiOperation)({ summary: 'Duplicar una transacción existente' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "duplicate", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.WorkspaceMemberRole.ADMIN),
    (0, common_1.Post)('check-limit'),
    (0, swagger_1.ApiOperation)({ summary: 'Verificar límite de categoría antes de crear' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, workspace_decorator_1.ActiveWorkspaceId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "checkLimit", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, swagger_1.ApiTags)('Transactions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, workspace_guard_1.WorkspaceGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiHeader)({
        name: 'x-workspace-id',
        description: 'ID del workspace activo',
        required: true,
    }),
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map