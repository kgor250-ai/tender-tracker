import { Controller, Get, Query } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('sources')
  async listSources() {
    return this.adminService.listSources();
  }

  @Get('collection-jobs')
  async listCollectionJobs() {
    return this.adminService.listCollectionJobs();
  }

  @Get('analytics/overview')
  async getAnalytics() {
    return this.adminService.getAnalyticsOverview();
  }

  @Get('audit-logs')
  async getAuditLogs(
    @Query('actorId') actorId?: string,
    @Query('resourceType') resourceType?: string,
    @Query('limit') limit?: number
  ) {
    return this.adminService.getAuditLogs({ actorId, resourceType, limit });
  }
}

