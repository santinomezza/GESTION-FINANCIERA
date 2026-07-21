import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { ActiveWorkspaceId } from '../common/decorators/workspace.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { BusinessWorkspaceGuard } from '../common/guards/business-workspace.guard';
import { WorkspaceMemberRole } from '@prisma/client';

@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceGuard, BusinessWorkspaceGuard, RolesGuard)
@ApiHeader({
    name: 'x-workspace-id',
    description: 'ID del workspace activo',
    required: true,
})
@Controller('clients')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @Roles(WorkspaceMemberRole.ADMIN)
  @Post()
    create(@ActiveWorkspaceId() workspaceId: string, @Body() createClientDto: CreateClientDto) {
        return this.clientsService.create(workspaceId, createClientDto);
    }

    @Get()
    findAll(@ActiveWorkspaceId() workspaceId: string) {
        return this.clientsService.findAll(workspaceId);
    }

    @Get(':id')
    findOne(@ActiveWorkspaceId() workspaceId: string, @Param('id') id: string) {
        return this.clientsService.findOne(workspaceId, id);
    }

    @Roles(WorkspaceMemberRole.ADMIN)
  @Patch(':id')
    update(@ActiveWorkspaceId() workspaceId: string, @Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
        return this.clientsService.update(workspaceId, id, updateClientDto);
    }

    @Roles(WorkspaceMemberRole.ADMIN)
  @Delete(':id')
    remove(@ActiveWorkspaceId() workspaceId: string, @Param('id') id: string) {
        return this.clientsService.remove(workspaceId, id);
    }
}
