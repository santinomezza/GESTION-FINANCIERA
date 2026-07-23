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
exports.CreateInvoiceDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const INVOICE_STATUSES = ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'];
class CreateInvoiceDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { invoiceNumber: { required: true, type: () => String }, issueDate: { required: true, type: () => Date }, dueDate: { required: true, type: () => Date }, totalAmount: { required: true, type: () => Number }, netAmount: { required: false, type: () => Number }, ivaPercentage: { required: false, type: () => Number }, ivaAmount: { required: false, type: () => Number }, status: { required: true, type: () => Object, enum: INVOICE_STATUSES }, clientId: { required: false, type: () => String }, urlArchivo: { required: false, type: () => String }, file: { required: false, type: () => String }, fileMimeType: { required: false, type: () => String } };
    }
}
exports.CreateInvoiceDto = CreateInvoiceDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "invoiceNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], CreateInvoiceDto.prototype, "issueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], CreateInvoiceDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateInvoiceDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateInvoiceDto.prototype, "netAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateInvoiceDto.prototype, "ivaPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateInvoiceDto.prototype, "ivaAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: INVOICE_STATUSES, default: 'PENDING' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsIn)(INVOICE_STATUSES),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "urlArchivo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: 'string', format: 'binary' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "file", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "fileMimeType", void 0);
//# sourceMappingURL=create-invoice.dto.js.map