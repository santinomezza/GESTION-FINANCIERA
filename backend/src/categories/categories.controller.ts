import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { ActiveWorkspaceId } from '../common/decorators/workspace.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { WorkspaceMemberRole } from '@prisma/client';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
@ApiHeader({
  name: 'x-workspace-id',
  description: 'ID del workspace activo',
  required: true,
})
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Roles(WorkspaceMemberRole.ADMIN)
  @Post()
  create(@ActiveWorkspaceId() workspaceId: string, @Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(workspaceId, createCategoryDto);
  }

  @Get()
  findAll(@ActiveWorkspaceId() workspaceId: string) {
    return this.categoriesService.findAll(workspaceId);
  }

  @Get(':id')
  findOne(@ActiveWorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.categoriesService.findOne(workspaceId, id);
  }

  @Roles(WorkspaceMemberRole.ADMIN)
  @Patch(':id')
  update(@ActiveWorkspaceId() workspaceId: string, @Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(workspaceId, id, updateCategoryDto);
  }

  @Roles(WorkspaceMemberRole.ADMIN)
  @Delete(':id')
  remove(@ActiveWorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.categoriesService.remove(workspaceId, id);
  }
}