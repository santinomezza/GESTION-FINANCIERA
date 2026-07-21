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
exports.CreateManualInvoiceDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateManualInvoiceDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { nro_factura: { required: true, type: () => String }, fecha: { required: true, type: () => String }, razon_social: { required: true, type: () => String }, cuit: { required: true, type: () => String }, importe_neto: { required: true, type: () => Number }, iva_21: { required: true, type: () => Number }, total: { required: true, type: () => Number }, estado_pago: { required: true, type: () => String } };
    }
}
exports.CreateManualInvoiceDto = CreateManualInvoiceDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateManualInvoiceDto.prototype, "nro_factura", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateManualInvoiceDto.prototype, "fecha", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateManualInvoiceDto.prototype, "razon_social", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateManualInvoiceDto.prototype, "cuit", void 0);
__decorate([
    (0, class_validator_1.IsDecimal)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateManualInvoiceDto.prototype, "importe_neto", void 0);
__decorate([
    (0, class_validator_1.IsDecimal)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateManualInvoiceDto.prototype, "iva_21", void 0);
__decorate([
    (0, class_validator_1.IsDecimal)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateManualInvoiceDto.prototype, "total", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['pendiente', 'pagada', 'parcial', 'vencida']),
    __metadata("design:type", String)
], CreateManualInvoiceDto.prototype, "estado_pago", void 0);
//# sourceMappingURL=create-manual-invoice.dto.js.map