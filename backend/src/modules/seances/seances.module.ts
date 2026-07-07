import { Module } from '@nestjs/common';
import { SeancesController } from './seances.controller';
import { SeancesService } from './seances.service';

@Module({
  controllers: [SeancesController],
  providers: [SeancesService],
  exports: [SeancesService],
})
export class SeancesModule {}
