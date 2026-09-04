import { Module } from '@nestjs/common';
import { PedagogieController } from './pedagogie.controller';
import { PedagogieService } from './pedagogie.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [PedagogieController],
  providers: [PedagogieService],
  exports: [PedagogieService],
})
export class PedagogieModule {}
