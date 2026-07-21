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
exports.SplitExpenseDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class PayerDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String }, amount: { required: true, type: () => Number, minimum: 0 } };
    }
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Santiago', description: 'Nombre de la persona' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PayerDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5000, description: 'Monto que pagó esta persona' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PayerDto.prototype, "amount", void 0);
class SplitExpenseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { payers: { required: true, type: () => [PayerDto] }, description: { required: false, type: () => String } };
    }
}
exports.SplitExpenseDto = SplitExpenseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PayerDto], description: 'Lista de personas y cuánto pagó cada una' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PayerDto),
    __metadata("design:type", Array)
], SplitExpenseDto.prototype, "payers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Asado del domingo', description: 'Descripción del gasto (opcional)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SplitExpenseDto.prototype, "description", void 0);
//# sourceMappingURL=split-expense.dto.js.map