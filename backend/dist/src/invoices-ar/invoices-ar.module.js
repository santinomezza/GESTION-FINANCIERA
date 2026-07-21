"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesArModule = void 0;
const common_1 = require("@nestjs/common");
const invoices_ar_controller_1 = require("./invoices-ar.controller");
const invoices_ar_service_1 = require("./invoices-ar.service");
const ai_module_1 = require("../ai/ai.module");
const common_module_1 = require("../common/common.module");
let InvoicesArModule = class InvoicesArModule {
};
exports.InvoicesArModule = InvoicesArModule;
exports.InvoicesArModule = InvoicesArModule = __decorate([
    (0, common_1.Module)({
        imports: [common_module_1.CommonModule, ai_module_1.AiModule],
        controllers: [invoices_ar_controller_1.InvoicesArController],
        providers: [invoices_ar_service_1.InvoicesArService],
        exports: [invoices_ar_service_1.InvoicesArService],
    })
], InvoicesArModule);
//# sourceMappingURL=invoices-ar.module.js.map