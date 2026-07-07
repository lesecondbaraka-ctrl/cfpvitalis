import { Module } from '@nestjs/common';
import { PedagogieController } from './pedagogie.controller';
import { PedagogieService } from './pedagogie.service';

@Module({
  controllers: [PedagogieController],
  providers: [PedagogieService],
  exports: [PedagogieService],
})
export class PedagogieModule {}
