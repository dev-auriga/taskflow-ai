import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard statistics, recent tasks, and upcoming tasks' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data including project/task stats, recent tasks, and upcoming tasks',
  })
  async getDashboard() {
    return this.dashboardService.getDashboard();
  }
}
