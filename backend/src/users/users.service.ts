import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true, email: true, name: true, role: true, avatarUrl: true,
        telegramId: true, telegramUsername: true, telegramLinkedAt: true,
        isActive: true, createdAt: true, lastLoginAt: true, preferences: true,
      },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; avatarUrl?: string; preferences?: any }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, avatarUrl: true, preferences: true },
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('Contraseña actual incorrecta');
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { message: 'Contraseña actualizada correctamente' };
  }

  async linkTelegram(userId: string, telegramId: string, telegramUsername?: string) {
    const existing = await this.prisma.user.findFirst({
      where: { telegramId, id: { not: userId } },
    });
    if (existing) throw new BadRequestException('Esta cuenta de Telegram ya está vinculada a otro usuario');

    return this.prisma.user.update({
      where: { id: userId },
      data: { telegramId, telegramUsername, telegramLinkedAt: new Date() },
      select: { id: true, telegramId: true, telegramUsername: true, telegramLinkedAt: true },
    });
  }

  async unlinkTelegram(userId: string) {
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

  async deleteAccount(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date(), isActive: false, email: `deleted_${Date.now()}_${userId}` },
    });
    return { message: 'Cuenta eliminada' };
  }
}
