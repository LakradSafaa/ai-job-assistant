import { Module } from '@nestjs/common';
import { JobsImportService } from './jobs-import.service';

@Module({
  providers: [JobsImportService]
})
export class JobsImportModule {}
