"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplitService = void 0;
const common_1 = require("@nestjs/common");
let SplitService = class SplitService {
    calculate(splitExpenseDto) {
        const { payers, description } = splitExpenseDto;
        const numPeople = payers.length;
        if (numPeople === 0) {
            return { total: 0, perPerson: 0, balances: [], settlements: [], summary: 'No hay participantes.' };
        }
        const total = payers.reduce((sum, payer) => sum + payer.amount, 0);
        const perPerson = total / numPeople;
        const balances = payers.map((payer) => ({
            name: payer.name,
            paid: payer.amount,
            shouldPay: parseFloat(perPerson.toFixed(2)),
            balance: parseFloat((payer.amount - perPerson).toFixed(2)),
        }));
        const debtors = balances
            .filter((p) => p.balance < -0.01)
            .sort((a, b) => a.balance - b.balance)
            .map(p => ({ name: p.name, balance: p.balance }));
        const creditors = balances
            .filter((p) => p.balance > 0.01)
            .sort((a, b) => b.balance - a.balance)
            .map(p => ({ name: p.name, balance: p.balance }));
        const settlements = [];
        const debtorsCopy = [...debtors];
        const creditorsCopy = [...creditors];
        let debtorIndex = 0;
        let creditorIndex = 0;
        while (debtorIndex < debtorsCopy.length && creditorIndex < creditorsCopy.length) {
            const debtor = debtorsCopy[debtorIndex];
            const creditor = creditorsCopy[creditorIndex];
            const amountToTransfer = parseFloat(Math.min(-debtor.balance, creditor.balance).toFixed(2));
            if (amountToTransfer > 0.01) {
                settlements.push({
                    from: debtor.name,
                    to: creditor.name,
                    amount: amountToTransfer,
                });
            }
            debtor.balance = parseFloat((debtor.balance + amountToTransfer).toFixed(2));
            creditor.balance = parseFloat((creditor.balance - amountToTransfer).toFixed(2));
            if (Math.abs(debtor.balance) < 0.01)
                debtorIndex++;
            if (Math.abs(creditor.balance) < 0.01)
                creditorIndex++;
        }
        const fmt = (n) => '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        let summary = `Total: ${fmt(total)} | ${numPeople} personas | ${fmt(perPerson)} c/u\n\n`;
        for (const b of balances) {
            const status = b.balance > 0.01 ? '🟢' : b.balance < -0.01 ? '🔴' : '⚪';
            const diff = b.balance > 0 ? `+${fmt(b.balance)}` : fmt(b.balance);
            summary += `${status} ${b.name}: pagó ${fmt(b.paid)} (${diff})\n`;
        }
        if (settlements.length > 0) {
            summary += '\nPara igualar:\n';
            for (const s of settlements) {
                summary += `💸 ${s.from} → ${s.to}: ${fmt(s.amount)}\n`;
            }
        }
        else {
            summary += '\n✅ Todos están a mano.';
        }
        return {
            total: parseFloat(total.toFixed(2)),
            perPerson: parseFloat(perPerson.toFixed(2)),
            balances,
            settlements,
            summary,
        };
    }
};
exports.SplitService = SplitService;
exports.SplitService = SplitService = __decorate([
    (0, common_1.Injectable)()
], SplitService);
//# sourceMappingURL=split.service.js.map