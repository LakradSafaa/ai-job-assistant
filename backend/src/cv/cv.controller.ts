import { Controller, Get, Query } from '@nestjs/common';
import { CvService } from './cv.service';

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Get()
  async findAll(@Query('profileId') profileId: string) {
    return this.cvService.findAll(profileId);
  }
}