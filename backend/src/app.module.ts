import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { SupabaseModule } from './supabase/supabase.module';
import { CvModule } from './cv/cv.module';
import { ParserModule } from './parser/parser.module';
import { AiModule } from './ai/ai.module';
import { JobsModule } from './jobs/jobs.module';
import { JobsImportModule } from './jobs-import/jobs-import.module';
import { FranceTravailModule } from './france-travail/france-travail.module';
import { HelloWorkModule } from './hellowork/hellowork.module';
import { ApecModule } from './apec/apec.module';
import { IndeedModule } from './indeed/indeed.module';
import { LinkedinModule } from './linkedin/linkedin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    SupabaseModule,
    CvModule,
    ParserModule,
    AiModule,

    // Jobs API
    JobsModule,

    JobsImportModule,
    FranceTravailModule,
    HelloWorkModule,
    ApecModule,
    IndeedModule,
    LinkedinModule,
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}