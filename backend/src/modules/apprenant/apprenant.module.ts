import { Module } from '@nestjs/common';
import { ApprenantController } from './apprenant.controller';
import { ApprenantService } from './apprenant.service';
import { PedagogieModule } from '../pedagogie/pedagogie.module';
import { CertificationModule } from '../certification/certification.module';

@Module({
  imports: [PedagogieModule, CertificationModule],
  controllers: [ApprenantController],
  providers: [ApprenantService],
  exports: [ApprenantService],
})
export class ApprenantModule {}
