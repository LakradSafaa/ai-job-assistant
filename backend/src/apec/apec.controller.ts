import { Controller, Get, Query } from '@nestjs/common';

import { ApecService } from './apec.service';

@Controller('apec')
export class ApecController {
  constructor(
    private readonly apecService: ApecService,
  ) {}

  @Get('jobs')
  async searchJobs(
    @Query('keyword') keyword?: string,
  ) {
    return this.apecService.searchJobs(keyword);
  }
}