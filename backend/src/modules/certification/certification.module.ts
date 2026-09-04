import { Module } from '@nestjs/common';
import { CertificationController } from './certification.controller';
import { CertificationService } from './certification.service';
import { PedagogieModule } from '../pedagogie/pedagogie.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PedagogieModule, NotificationsModule],
  controllers: [CertificationController],
  providers: [CertificationService],
  exports: [CertificationService],
})
export class CertificationModule {}
