import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiOperation } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import { CreateGoalDto, UpdateGoalDto } from './dto/create-goal.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ActiveWorkspaceId } from '../common/decorators/workspace.decorator';
import { WorkspaceMemberRole } from '@prisma/client';

@ApiTags('Goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
@ApiHeader({
  name: 'x-workspace-id',
  description: 'ID del workspace activo',
  required: true,
})
@Controller('goals')
export class GoalsController {
    constructor(private readonly goalsService: GoalsService) { }

    @Get()
    findAll(@ActiveWorkspaceId() workspaceId: string) {
        return this.goalsService.findAll(workspaceId);
    }

    @Get('stats')
    getStats(@ActiveWorkspaceId() workspaceId: string) {
        return this.goalsService.getStats(workspaceId);
    }

    @Get(':id')
    findOne(@ActiveWorkspaceId() workspaceId: string, @Param('id') id: string) {
        return this.goalsService.findOne(workspaceId, id);
    }

    @Roles(WorkspaceMemberRole.ADMIN)
  @Post()
    @ApiOperation({ summary: 'Crear una nueva meta de ahorro' })
    create(@ActiveWorkspaceId() workspaceId: string, @Body() dto: CreateGoalDto) {
        return this.goalsService.create(workspaceId, dto);
    }

    @Roles(WorkspaceMemberRole.ADMIN)
  @Patch(':id')
    @ApiOperation({ summary: 'Actualizar una meta de ahorro' })
    update(@ActiveWorkspaceId() workspaceId: string, @Param('id') id: string, @Body() dto: UpdateGoalDto) {
        return this.goalsService.update(workspaceId, id, dto);
    }

    @Roles(WorkspaceMemberRole.ADMIN)
  @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una meta de ahorro' })
    remove(@ActiveWorkspaceId() workspaceId: string, @Param('id') id: string) {
        return this.goalsService.remove(workspaceId, id);
    }
}
