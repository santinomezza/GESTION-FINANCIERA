import { Controller, Get, Post, Body, Delete, UseGuards, Request, Param, Patch } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { WorkspaceMemberRole } from '@prisma/client';

@Controller('invitations')
@UseGuards(JwtAuthGuard)
export class InvitationsController {
    constructor(private readonly service: InvitationsService) { }

    @Get()
    @UseGuards(WorkspaceGuard, RolesGuard)
    @Roles(WorkspaceMemberRole.OWNER, WorkspaceMemberRole.ADMIN)
    findAll(@Request() req) {
        return this.service.findAll(req.workspaceId);
    }

    @Post()
    @UseGuards(WorkspaceGuard, RolesGuard)
    @Roles(WorkspaceMemberRole.OWNER, WorkspaceMemberRole.ADMIN)
    create(@Request() req, @Body() data: any) {
        return this.service.create(req.workspaceId, {
            ...data,
            createdBy: req.user.id,
        });
    }

    @Post('use')
    useInvitation(@Request() req, @Body() data: { code: string }) {
        return this.service.useInvitation(data.code, req.user.id);
    }

    @Delete(':id')
    @UseGuards(WorkspaceGuard, RolesGuard)
    @Roles(WorkspaceMemberRole.OWNER, WorkspaceMemberRole.ADMIN)
    delete(@Request() req, @Param('id') id: string) {
        return this.service.delete(id, req.workspaceId);
    }

    @Patch(':id')
    @UseGuards(WorkspaceGuard, RolesGuard)
    @Roles(WorkspaceMemberRole.OWNER, WorkspaceMemberRole.ADMIN)
    update(@Param('id') id: string, @Request() req, @Body() data: { role?: WorkspaceMemberRole; displayName?: string; expiresAt?: string }) {
        const updateData: any = {};
        if (data.role !== undefined) updateData.role = data.role;
        if (data.displayName !== undefined) updateData.displayName = data.displayName;
        if (data.expiresAt !== undefined) updateData.expiresAt = new Date(data.expiresAt);
        return this.service.update(id, req.workspaceId, updateData);
    }
}