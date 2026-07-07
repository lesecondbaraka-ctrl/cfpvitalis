import { Module } from '@nestjs/common';
import { DevoirsController } from './devoirs.controller';
import { DevoirsService } from './devoirs.service';

@Module({
  controllers: [DevoirsController],
  providers: [DevoirsService],
})
export class DevoirsModule {}
