import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionsDto } from './dto/filter-transactions.dto';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiOperation } from '@nestjs/swagger';
import { ActiveWorkspaceId } from '../common/decorators/workspace.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { WorkspaceMemberRole } from '@prisma/client';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
@ApiHeader({
  name: 'x-workspace-id',
  description: 'ID del workspace activo',
  required: true,
})
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) { }

  @Roles(WorkspaceMemberRole.ADMIN)
  @Post()
  create(@ActiveWorkspaceId() workspaceId: string, @Request() req, @Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(workspaceId, createTransactionDto, req.user.sub);
  }

  @Get()
  findAll(@ActiveWorkspaceId() workspaceId: string, @Query() filterDto: FilterTransactionsDto) {
    return this.transactionsService.findAll(workspaceId, filterDto);
  }

  @Get(':id')
  findOne(@ActiveWorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.transactionsService.findOne(workspaceId, id);
  }

  @Roles(WorkspaceMemberRole.ADMIN)
  @Patch(':id')
  update(@ActiveWorkspaceId() workspaceId: string, @Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionsService.update(workspaceId, id, updateTransactionDto);
  }

  @Roles(WorkspaceMemberRole.ADMIN)
  @Delete(':id')
  remove(@ActiveWorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.transactionsService.remove(workspaceId, id);
  }

  @Roles(WorkspaceMemberRole.ADMIN)
  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicar una transacción existente' })
  duplicate(@ActiveWorkspaceId() workspaceId: string, @Param('id') id: string, @Request() req) {
    return this.transactionsService.duplicate(workspaceId, id, req.user.sub);
  }

  @Roles(WorkspaceMemberRole.ADMIN)
  @Post('check-limit')
  @ApiOperation({ summary: 'Verificar límite de categoría antes de crear' })
  checkLimit(@ActiveWorkspaceId() workspaceId: string, @Body() data: { categoryId: string; amount: number }) {
    return this.transactionsService.checkCategoryLimit(workspaceId, data.categoryId, data.amount);
  }
}