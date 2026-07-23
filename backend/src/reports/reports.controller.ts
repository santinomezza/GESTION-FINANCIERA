import { Controller, Get, Query, Res, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ActiveWorkspaceId } from '../common/decorators/workspace.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Response } from 'express';
import { format } from 'date-fns';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
@ApiHeader({
  name: 'x-workspace-id',
  description: 'ID del workspace activo',
  required: true,
})
@Controller('reports')
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);
  constructor(private reportsService: ReportsService) {}

  @Get('export/csv')
  @ApiOperation({ summary: 'Exportar movimientos a CSV' })
  async exportCSV(
    @CurrentUser('id') userId: string,
    @ActiveWorkspaceId() workspaceId: string,
    @Query() filters: any,
    @Res() res: Response,
  ) {
    try {
      const csv = await this.reportsService.generateCSV(userId, workspaceId, filters);
      const filename = `gestionar2_${format(new Date(), 'yyyyMMdd')}.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send('\uFEFF' + csv);
    } catch (err: any) {
      this.logger.error('Error exportando CSV:', err);
      res.status(500).json({ message: err.message || 'Error al exportar CSV' });
    }
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Exportar movimientos a Excel' })
  async exportExcel(
    @CurrentUser('id') userId: string,
    @ActiveWorkspaceId() workspaceId: string,
    @Query() filters: any,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.reportsService.generateExcel(userId, workspaceId, filters);
      const filename = `gestionar2_${format(new Date(), 'yyyyMMdd')}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (err: any) {
      this.logger.error('Error exportando Excel:', err);
      res.status(500).json({ message: err.message || 'Error al exportar Excel' });
    }
  }

  @Get('export/invoices/excel')
  @ApiOperation({ summary: 'Exportar facturas a Excel con URLs de archivos' })
  async exportInvoicesExcel(
    @CurrentUser('id') userId: string,
    @ActiveWorkspaceId() workspaceId: string,
    @Query() filters: any,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.reportsService.generateInvoicesExcel(userId, workspaceId, filters);
      const filename = `facturas_${format(new Date(), 'yyyyMMdd')}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (err: any) {
      this.logger.error('Error exportando facturas Excel:', err);
      res.status(500).json({ message: err.message || 'Error al exportar facturas' });
    }
  }
}
