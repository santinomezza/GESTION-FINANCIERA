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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcryptjs");
const prisma_service_1 = require("../common/prisma/prisma.service");
const users_service_1 = require("../users/users.service");
const client_1 = require("@prisma/client");
const workspaces_service_1 = require("../common/guards/workspaces.service");
const email_service_1 = require("../common/services/email.service");
let AuthService = class AuthService {
    constructor(prisma, usersService, jwtService, config, workspacesService, emailService) {
        this.prisma = prisma;
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.config = config;
        this.workspacesService = workspacesService;
        this.emailService = emailService;
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (existing) {
            throw new common_1.ConflictException('El email ya está registrado');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase(),
                name: dto.name,
                passwordHash,
            },
        });
        const workspaceType = dto.workspaceType === 'BUSINESS' ? client_1.WorkspaceType.BUSINESS : client_1.WorkspaceType.PERSONAL;
        const workspace = await this.workspacesService.createWithDefaults(user.id, {
            name: workspaceType === client_1.WorkspaceType.BUSINESS ? (dto.workspaceName || 'Negocio 1') : 'Personal',
            type: workspaceType,
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return { user: this.sanitizeUser(user), ...tokens };
    }
    async login(dto) {
        const user = await this.prisma.user.findFirst({
            where: { email: dto.email.toLowerCase(), deletedAt: null },
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const isValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return { user: this.sanitizeUser(user), ...tokens };
    }
    async refreshTokens(userId, refreshToken) {
        const stored = await this.prisma.refreshToken.findFirst({
            where: { userId, token: refreshToken, revokedAt: null },
            include: { user: true },
        });
        if (!stored || stored.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Token inválido o expirado');
        }
        await this.prisma.refreshToken.update({
            where: { id: stored.id },
            data: { revokedAt: new Date() },
        });
        const tokens = await this.generateTokens(stored.user.id, stored.user.email, stored.user.role);
        return { user: this.sanitizeUser(stored.user), ...tokens };
    }
    async logout(userId) {
        await this.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return { message: 'Sesión cerrada' };
    }
    async validateTelegramUser(telegramId) {
        const user = await this.prisma.user.findFirst({
            where: { telegramId: String(telegramId), deletedAt: null, isActive: true },
        });
        return user;
    }
    async generateTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const accessToken = this.jwtService.sign(payload);
        const refreshExpiresIn = this.config.get('jwt.refreshExpiresIn') || '30d';
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.config.get('jwt.refreshSecret'),
            expiresIn: refreshExpiresIn,
        });
        const daysMatch = refreshExpiresIn.match(/^(\d+)d$/);
        const days = daysMatch ? parseInt(daysMatch[1]) : 30;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);
        await this.prisma.refreshToken.create({
            data: { userId, token: refreshToken, expiresAt },
        });
        return { accessToken, refreshToken };
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findFirst({
            where: { email: dto.email.toLowerCase(), deletedAt: null, isActive: true },
        });
        if (!user) {
            return { message: 'Si el email existe, recibirás un correo con instrucciones' };
        }
        await this.prisma.passwordResetToken.updateMany({
            where: { userId: user.id, usedAt: null },
            data: { usedAt: new Date() },
        });
        const token = this.generateSecureToken();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);
        await this.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token,
                expiresAt,
            },
        });
        await this.emailService.sendPasswordResetEmail(user.email, user.name, token);
        return { message: 'Si el email existe, recibirás un correo con instrucciones' };
    }
    async resetPassword(dto) {
        const resetToken = await this.prisma.passwordResetToken.findUnique({
            where: { token: dto.token },
            include: { user: true },
        });
        if (!resetToken || resetToken.usedAt) {
            throw new common_1.BadRequestException('Token inválido o ya utilizado');
        }
        if (resetToken.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Token expirado');
        }
        const passwordHash = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.user.update({
            where: { id: resetToken.userId },
            data: { passwordHash },
        });
        await this.prisma.passwordResetToken.update({
            where: { id: resetToken.id },
            data: { usedAt: new Date() },
        });
        await this.prisma.refreshToken.updateMany({
            where: { userId: resetToken.userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return { message: 'Contraseña restablecida exitosamente' };
    }
    generateSecureToken() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        const randomValues = new Uint8Array(32);
        crypto.getRandomValues(randomValues);
        for (let i = 0; i < randomValues.length; i++) {
            token += chars[randomValues[i] % chars.length];
        }
        return token;
    }
    sanitizeUser(user) {
        const { passwordHash, ...rest } = user;
        return rest;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService,
        workspaces_service_1.WorkspacesService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map