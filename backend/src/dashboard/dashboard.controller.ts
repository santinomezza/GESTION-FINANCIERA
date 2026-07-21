import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { ActiveWorkspaceId } from '../common/decorators/workspace.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
@ApiHeader({
  name: 'x-workspace-id',
  description: 'ID del workspace activo',
  required: true,
})
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('overview')
  getOverview(@ActiveWorkspaceId() workspaceId: string, @Query('year') year?: string) {
    return this.dashboardService.getOverview(workspaceId, year ? +year : undefined);
  }

  @Get('expenses')
  getExpensesDashboard(@ActiveWorkspaceId() workspaceId: string, @Query('months') months?: string) {
    return this.dashboardService.getExpensesDashboard(workspaceId, months ? +months : 6);
  }

  @Get('income')
  getIncomeDashboard(@ActiveWorkspaceId() workspaceId: string, @Query('months') months?: string) {
    return this.dashboardService.getIncomeDashboard(workspaceId, months ? +months : 6);
  }

  @Get('profitability')
  getProfitabilityDashboard(@ActiveWorkspaceId() workspaceId: string, @Query('months') months?: string) {
    return this.dashboardService.getProfitabilityDashboard(workspaceId, months ? +months : 12);
  }
}