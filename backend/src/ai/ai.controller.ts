import { Controller, Get, Post, Param } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
  ) {}

  @Post('analyze-cv/:cvId')
  async analyzeCv(
    @Param('cvId') cvId: string,
  ) {
    return this.aiService.analyzeCv(cvId);
  }

  @Get('report/:cvId')
  async getReport(
    @Param('cvId') cvId: string,
  ) {
    return this.aiService.getReport(cvId);
  }
}