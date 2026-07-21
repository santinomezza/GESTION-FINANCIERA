"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramModule = void 0;
const common_1 = require("@nestjs/common");
const telegram_controller_1 = require("./telegram.controller");
const telegram_service_1 = require("./telegram.service");
const telegram_monthly_summary_service_1 = require("./telegram-monthly-summary.service");
const ai_module_1 = require("../ai/ai.module");
const categories_module_1 = require("../categories/categories.module");
const transactions_module_1 = require("../transactions/transactions.module");
const dashboard_module_1 = require("../dashboard/dashboard.module");
const invoices_module_1 = require("../invoices.module");
const clients_module_1 = require("../clients/clients.module");
const workspaces_module_1 = require("../common/guards/workspaces.module");
const notifications_module_1 = require("../notifications/notifications.module");
let TelegramModule = class TelegramModule {
};
exports.TelegramModule = TelegramModule;
exports.TelegramModule = TelegramModule = __decorate([
    (0, common_1.Module)({
        imports: [ai_module_1.AiModule, categories_module_1.CategoriesModule, transactions_module_1.TransactionsModule, dashboard_module_1.DashboardModule, invoices_module_1.InvoicesModule, clients_module_1.ClientsModule, workspaces_module_1.WorkspacesModule, notifications_module_1.NotificationsModule],
        controllers: [telegram_controller_1.TelegramController],
        providers: [telegram_service_1.TelegramService, telegram_monthly_summary_service_1.TelegramMonthlySummaryService],
        exports: [telegram_service_1.TelegramService, telegram_monthly_summary_service_1.TelegramMonthlySummaryService],
    })
], TelegramModule);
//# sourceMappingURL=telegram.module.js.map