import { Controller, Get, Put, Body, Delete, Post, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener perfil propio' })
  async getMe(@CurrentUser('id') userId: string) {
    return this.usersService.findById(userId);
  }

  @Put('me')
  @ApiOperation({ summary: 'Actualizar perfil' })
  async updateMe(
    @CurrentUser('id') userId: string,
    @Body() body: { name?: string; avatarUrl?: string; preferences?: any },
  ) {
    return this.usersService.updateProfile(userId, body);
  }

  @Put('me/password')
  @ApiOperation({ summary: 'Cambiar contraseña' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.usersService.changePassword(userId, body.currentPassword, body.newPassword);
  }

  @Post('me/telegram/link')
  @ApiOperation({ summary: 'Vincular cuenta Telegram' })
  async linkTelegram(
    @CurrentUser('id') userId: string,
    @Body() body: { telegramId: string; telegramUsername?: string },
  ) {
    return this.usersService.linkTelegram(userId, body.telegramId, body.telegramUsername);
  }

  @Post('me/telegram/unlink')
  @ApiOperation({ summary: 'Desvincular Telegram' })
  async unlinkTelegram(@CurrentUser('id') userId: string) {
    return this.usersService.unlinkTelegram(userId);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Eliminar cuenta' })
  async deleteAccount(@CurrentUser('id') userId: string) {
    return this.usersService.deleteAccount(userId);
  }
}
