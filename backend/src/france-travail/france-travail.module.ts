import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FranceTravailController } from './france-travail.controller';
import { FranceTravailService } from './france-travail.service';

@Module({
  imports: [ConfigModule],
  controllers: [FranceTravailController],
  providers: [FranceTravailService],
  exports: [FranceTravailService],
})
export class FranceTravailModule {}