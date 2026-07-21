import { Controller, Get, Post, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { AIRecommendationsService } from './ai-recommendations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { WorkspaceMemberRole } from '@prisma/client';

@Controller('ai-recommendations')
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
export class AIRecommendationsController {
    constructor(private readonly service: AIRecommendationsService) { }

    @Get()
    findAll(@Request() req) {
        return this.service.findAll(req.user.id, req.workspaceId);
    }

    @Get('pending')
    getPending(@Request() req) {
        return this.service.getPendingRecommendations(req.user.id, req.workspaceId);
    }

    @Roles(WorkspaceMemberRole.ADMIN)
  @Post('generate')
    generate(@Request() req) {
        return this.service.generateRecommendations(req.user.id, req.workspaceId);
    }

    @Roles(WorkspaceMemberRole.ADMIN)
  @Patch(':id/read')
    markAsRead(@Param('id') id: string, @Request() req) {
        return this.service.markAsRead(id, req.user.id);
    }

    @Roles(WorkspaceMemberRole.ADMIN)
  @Patch(':id/dismiss')
    dismiss(@Param('id') id: string, @Request() req) {
        return this.service.dismiss(id, req.user.id);
    }
}