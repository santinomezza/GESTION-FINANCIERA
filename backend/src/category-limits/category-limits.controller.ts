import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CategoryLimitsService } from './category-limits.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { WorkspaceMemberRole } from '@prisma/client';

@Controller('category-limits')
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
export class CategoryLimitsController {
    constructor(private readonly service: CategoryLimitsService) { }

    @Get()
    findAll(@Request() req) {
        return this.service.findAll(req.workspaceId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.service.findOne(id, req.workspaceId);
    }

    @Roles(WorkspaceMemberRole.ADMIN)
  @Post()
    create(@Request() req, @Body() data: any) {
        return this.service.create(req.workspaceId, data);
    }

    @Roles(WorkspaceMemberRole.ADMIN)
  @Patch(':id')
    update(@Param('id') id: string, @Request() req, @Body() data: any) {
        return this.service.update(id, req.workspaceId, data);
    }

    @Roles(WorkspaceMemberRole.ADMIN)
  @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.service.delete(id, req.workspaceId);
    }

    @Roles(WorkspaceMemberRole.ADMIN)
  @Post('check')
    checkLimit(@Request() req, @Body() data: { categoryId: string; amount: number }) {
        return this.service.checkLimit(req.workspaceId, data.categoryId, data.amount);
    }
}