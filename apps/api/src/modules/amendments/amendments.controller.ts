import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AmendmentsService } from './amendments.service';

@Controller('amendments')
export class AmendmentsController {
  constructor(private amendmentsService: AmendmentsService) {}

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.amendmentsService.findById(id);
  }

  @Post(':id/process')
  async triggerProcess(@Param('id') id: string) {
    return this.amendmentsService.triggerProcess(id);
  }

  @Get(':id/changes')
  async getChanges(@Param('id') id: string) {
    return this.amendmentsService.getChanges(id);
  }

  @Get(':id/compare')
  async getComparison(@Param('id') id: string) {
    return this.amendmentsService.getComparison(id);
  }
}

