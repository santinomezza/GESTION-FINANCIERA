"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryLimitsModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../common/prisma/prisma.module");
const category_limits_service_1 = require("./category-limits.service");
const category_limits_controller_1 = require("./category-limits.controller");
let CategoryLimitsModule = class CategoryLimitsModule {
};
exports.CategoryLimitsModule = CategoryLimitsModule;
exports.CategoryLimitsModule = CategoryLimitsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [category_limits_controller_1.CategoryLimitsController],
        providers: [category_limits_service_1.CategoryLimitsService],
        exports: [category_limits_service_1.CategoryLimitsService],
    })
], CategoryLimitsModule);
//# sourceMappingURL=category-limits.module.js.map