import { Controller, Get, Patch, Post, Param, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Request() req: any) {
    const userId = req.user?.id || 'demo-user-id';
    return this.notificationsService.getUserNotifications(userId);
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id || 'demo-user-id';
    return this.notificationsService.markAsRead(id, userId);
  }

  @Post('read-all')
  async markAllRead(@Request() req: any) {
    const userId = req.user?.id || 'demo-user-id';
    return this.notificationsService.markAllAsRead(userId);
  }
}

