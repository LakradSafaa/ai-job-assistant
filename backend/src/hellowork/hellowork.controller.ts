import { Controller, Get, Query } from '@nestjs/common';
import { HelloWorkService } from './hellowork.service';

@Controller('hellowork')
export class HelloWorkController {
  constructor(
    private readonly helloWorkService: HelloWorkService,
  ) {}

  @Get('jobs')
  async searchJobs(
    @Query('keyword') keyword?: string,
  ) {
    return this.helloWorkService.searchJobs(keyword);
  }
}