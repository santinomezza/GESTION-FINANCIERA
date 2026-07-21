import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { WorkspaceMembersService } from './workspace-members.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { WorkspaceMemberRole } from '@prisma/client';

@Controller('workspace-members')
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
export class WorkspaceMembersController {
    constructor(private readonly service: WorkspaceMembersService) { }

    @Get()
    @Roles(WorkspaceMemberRole.OWNER, WorkspaceMemberRole.ADMIN, WorkspaceMemberRole.ACCOUNTANT, WorkspaceMemberRole.PARTNER, WorkspaceMemberRole.VIEWER)
    findAll(@Request() req) {
        return this.service.findAll(req.workspaceId);
    }

    @Get(':id')
    @Roles(WorkspaceMemberRole.OWNER, WorkspaceMemberRole.ADMIN, WorkspaceMemberRole.ACCOUNTANT, WorkspaceMemberRole.PARTNER, WorkspaceMemberRole.VIEWER)
    findOne(@Param('id') id: string, @Request() req) {
        return this.service.findOne(id, req.workspaceId);
    }

    @Post()
    @Roles(WorkspaceMemberRole.OWNER, WorkspaceMemberRole.ADMIN)
    invite(@Request() req, @Body() data: { userId: string; role?: WorkspaceMemberRole; displayName?: string }) {
        return this.service.invite(req.workspaceId, {
            ...data,
            invitedBy: req.user.id,
        });
    }

    @Patch(':id/role')
    @Roles(WorkspaceMemberRole.OWNER, WorkspaceMemberRole.ADMIN)
    updateRole(@Param('id') id: string, @Request() req, @Body() data: { role: WorkspaceMemberRole; displayName?: string }) {
        return this.service.updateRole(id, req.workspaceId, data.role, data.displayName);
    }

    @Delete(':id')
    @Roles(WorkspaceMemberRole.OWNER, WorkspaceMemberRole.ADMIN)
    remove(@Param('id') id: string, @Request() req) {
        return this.service.remove(id, req.workspaceId);
    }
}