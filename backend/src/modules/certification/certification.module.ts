import { Module } from '@nestjs/common';
import { CertificationController } from './certification.controller';
import { CertificationService } from './certification.service';
import { PedagogieModule } from '../pedagogie/pedagogie.module';

@Module({
  imports: [PedagogieModule],
  controllers: [CertificationController],
  providers: [CertificationService],
  exports: [CertificationService],
})
export class CertificationModule {}
