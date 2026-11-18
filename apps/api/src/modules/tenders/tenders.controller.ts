import { Controller, Get, Post, Body, Param, Query, Request, Delete } from '@nestjs/common';
import { TendersService } from './tenders.service';

@Controller('tenders')
export class TendersController {
  constructor(private tendersService: TendersService) {}

  @Get()
  async search(
    @Query('q') query?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.tendersService.search({ query, status, category, page, limit });
  }

  @Post()
  async create(@Body() body: any, @Request() req: any) {
    return this.tendersService.create(body, req.user?.id);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.tendersService.findById(id);
  }

  @Get(':id/timeline')
  async getTimeline(@Param('id') id: string) {
    return this.tendersService.getTimeline(id);
  }

  @Get(':id/versions')
  async getVersions(@Param('id') id: string) {
    return this.tendersService.getVersions(id);
  }

  @Post(':id/follow')
  async follow(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id || 'demo-user-id';
    return this.tendersService.follow(id, userId);
  }

  @Delete(':id/follow')
  async unfollow(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id || 'demo-user-id';
    return this.tendersService.unfollow(id, userId);
  }
}

