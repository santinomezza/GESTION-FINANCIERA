"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInvoiceDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const create_invoice_dto_1 = require("./create-invoice.dto");
class UpdateInvoiceDto extends (0, swagger_1.PartialType)(create_invoice_dto_1.CreateInvoiceDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateInvoiceDto = UpdateInvoiceDto;
//# sourceMappingURL=update-invoice.dto.js.map