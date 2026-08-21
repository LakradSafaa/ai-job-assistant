import { Module } from '@nestjs/common';

import { ApecController } from './apec.controller';
import { ApecService } from './apec.service';

@Module({
  controllers: [ApecController],
  providers: [ApecService],
})
export class ApecModule {}