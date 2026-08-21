import { Controller, Get, Query } from '@nestjs/common';
import { FranceTravailService } from './france-travail.service';

@Controller('france-travail')
export class FranceTravailController {
  constructor(private readonly franceTravailService: FranceTravailService) {}

  @Get('test')
  async testAuth() {
    const token = await this.franceTravailService.getAccessToken();
    return {
      success: true,
      message: 'Authentification France Travail réussie',
      token_received: !!token,
    };
  }

  @Get('jobs')
  async testFetchJobs(@Query('motsCles') motsCles?: string) {
    return this.franceTravailService.searchJobs({ motsCles });
  }
}