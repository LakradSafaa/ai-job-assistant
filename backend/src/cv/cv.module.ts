import { Module } from '@nestjs/common';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { ParserModule } from '../parser/parser.module';

@Module({
  imports: [
    SupabaseModule,
    ParserModule,
  ],
  controllers: [CvController],
  providers: [CvService],
})
export class CvModule {}