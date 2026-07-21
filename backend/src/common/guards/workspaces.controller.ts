import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CreateWorkspaceDto } from './create-workspace.dto';
import { UpdateWorkspaceDto } from './update-workspace.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { InvitationsService } from '../../invitations/invitations.service';

@ApiTags('Workspaces')
@ApiBearerAuth()
@Controller('workspaces')
export class WorkspacesController {
    constructor(private readonly workspacesService: WorkspacesService, private readonly invitationsService: InvitationsService) { }

    @Get()
    findAll(@CurrentUser('sub') userId: string) {
        return this.workspacesService.findAllForUser(userId);
    }

    @Get(':id')
    findOne(@CurrentUser('sub') userId: string, @Param('id') id: string) {
        return this.workspacesService.findById(id, userId);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Crear un nuevo workspace (personal o empresarial)' })
    create(@CurrentUser('sub') userId: string, @Body() dto: CreateWorkspaceDto) {
        return this.workspacesService.createWithDefaults(userId, dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Actualizar el nombre de un workspace' })
    update(@CurrentUser('sub') userId: string, @Param('id') id: string, @Body() dto: UpdateWorkspaceDto) {
        return this.workspacesService.update(id, userId, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Eliminar un workspace y todos sus datos' })
    remove(@CurrentUser('sub') userId: string, @Param('id') id: string) {
        return this.workspacesService.remove(id, userId);
    }

    @Post('join')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Unirse a un workspace mediante código de invitación' })
    join(@CurrentUser('sub') userId: string, @Body() data: { code: string }) {
        return this.invitationsService.useInvitation(data.code, userId);
    }
}
