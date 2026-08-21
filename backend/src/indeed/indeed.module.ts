import { Module } from '@nestjs/common';
import { IndeedController } from './indeed.controller';
import { IndeedService } from './indeed.service';

@Module({
  controllers: [IndeedController],
  providers: [IndeedService]
})
export class IndeedModule {}
