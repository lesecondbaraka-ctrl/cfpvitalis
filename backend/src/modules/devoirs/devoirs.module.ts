import { Module } from '@nestjs/common';
import { DevoirsController } from './devoirs.controller';
import { DevoirsService } from './devoirs.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [DevoirsController],
  providers: [DevoirsService],
})
export class DevoirsModule {}
