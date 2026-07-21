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
exports.SplitController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const split_expense_dto_1 = require("./split-expense.dto");
const split_service_1 = require("./split.service");
let SplitController = class SplitController {
    constructor(splitService) {
        this.splitService = splitService;
    }
    splitExpense(splitExpenseDto) {
        return this.splitService.calculate(splitExpenseDto);
    }
};
exports.SplitController = SplitController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Calcula cómo dividir un gasto entre varias personas para que todos paguen lo mismo.',
        description: 'Recibe una lista de personas y cuánto pagó cada una, y devuelve las transferencias necesarias para saldar deudas. Soporta división equitativa: el total se divide en partes iguales y se calcula quién debe a quién.',
    }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [split_expense_dto_1.SplitExpenseDto]),
    __metadata("design:returntype", void 0)
], SplitController.prototype, "splitExpense", null);
exports.SplitController = SplitController = __decorate([
    (0, swagger_1.ApiTags)('Split Tool'),
    (0, common_1.Controller)('split'),
    __metadata("design:paramtypes", [split_service_1.SplitService])
], SplitController);
//# sourceMappingURL=split.controller.js.map