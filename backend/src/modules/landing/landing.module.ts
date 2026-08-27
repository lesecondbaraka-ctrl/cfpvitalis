import { Module } from '@nestjs/common';
import { LandingController } from './landing.controller';
import { LandingService } from './landing.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [NotificationsModule, CommonModule],
  controllers: [LandingController],
  providers: [LandingService],
  exports: [LandingService],
})
export class LandingModule {}
