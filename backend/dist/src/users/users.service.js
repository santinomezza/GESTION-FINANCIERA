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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const bcrypt = require("bcryptjs");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const user = await this.prisma.user.findFirst({
            where: { id, deletedAt: null },
            select: {
                id: true, email: true, name: true, role: true, avatarUrl: true,
                telegramId: true, telegramUsername: true, telegramLinkedAt: true,
                isActive: true, createdAt: true, lastLoginAt: true, preferences: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        return user;
    }
    async updateProfile(userId, data) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
            select: { id: true, name: true, email: true, avatarUrl: true, preferences: true },
        });
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const valid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!valid)
            throw new common_1.BadRequestException('Contraseña actual incorrecta');
        const passwordHash = await bcrypt.hash(newPassword, 12);
        await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
        return { message: 'Contraseña actualizada correctamente' };
    }
    async linkTelegram(userId, telegramId, telegramUsername) {
        const existing = await this.prisma.user.findFirst({
            where: { telegramId, id: { not: userId } },
        });
        if (existing)
            throw new common_1.BadRequestException('Esta cuenta de Telegram ya está vinculada a otro usuario');
        return this.prisma.user.update({
            where: { id: userId },
            data: { telegramId, telegramUsername, telegramLinkedAt: new Date() },
            select: { id: true, telegramId: true, telegramUsername: true, telegramLinkedAt: true },
        });
    }
    async unlinkTelegram(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { telegramId: null, telegramUsername: null, telegramLinkedAt: null },
            select: { id: true, telegramId: true },
        });
    }
    async findAll() {
        return this.prisma.user.findMany({
            where: { deletedAt: null },
            select: {
                id: true, email: true, name: true, role: true, isActive: true,
                telegramId: true, createdAt: true, lastLoginAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async deleteAccount(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { deletedAt: new Date(), isActive: false, email: `deleted_${Date.now()}_${userId}` },
        });
        return { message: 'Cuenta eliminada' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map