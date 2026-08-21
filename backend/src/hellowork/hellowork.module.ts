import { Module } from '@nestjs/common';
import { HelloWorkController } from './hellowork.controller';
import { HelloWorkService } from './hellowork.service';

@Module({
  controllers: [HelloWorkController],
  providers: [HelloWorkService],
  exports: [HelloWorkService],
})
export class HelloWorkModule {}