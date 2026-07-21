import { Controller, Get, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { WorkspaceMemberRole } from '@prisma/client';

@Controller('notifications')
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) { }

  @Get()
  findAll(@Request() req) {
    return this.service.findAll(req.user.id);
  }

  @Get('unread')
  getUnread(@Request() req) {
    return this.service.getUnreadNotifications(req.user.id);
  }

  @Get('unread/count')
  getUnreadCount(@Request() req) {
    return this.service.getUnreadCount(req.user.id);
  }

  @Roles(WorkspaceMemberRole.ADMIN)
  @Patch(':id/read')
  markRead(@Request() req, @Param('id') id: string) {
    return this.service.markRead(req.user.id, id);
  }

  @Roles(WorkspaceMemberRole.ADMIN)
  @Patch('read-all')
  markAllRead(@Request() req) {
    return this.service.markAllRead(req.user.id);
  }

  @Roles(WorkspaceMemberRole.ADMIN)
  @Delete(':id')
  delete(@Request() req, @Param('id') id: string) {
    return this.service.delete(req.user.id, id);
  }
}