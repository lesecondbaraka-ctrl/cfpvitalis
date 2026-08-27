import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { IdentityService } from './identity.service';
import { ReferentielService } from './referentiel.service';
import { ReferentielController } from './referentiel.controller';
import { SessionsAdmissionService } from './sessions-admission.service';
import { SessionsAdmissionController } from './sessions-admission.controller';
import { CandidatureService } from './candidature.service';
import { CandidatureController } from './candidature.controller';
import { InscriptionsService } from './inscriptions.service';
import { InscriptionsController } from './inscriptions.controller';
import { IdentiteApprenantController } from './identite-apprenant.controller';

@Module({
  imports: [NotificationsModule],
  controllers: [
    ReferentielController,
    SessionsAdmissionController,
    CandidatureController,
    InscriptionsController,
    IdentiteApprenantController,
  ],
  providers: [IdentityService, ReferentielService, SessionsAdmissionService, CandidatureService, InscriptionsService],
  exports: [IdentityService, InscriptionsService, CandidatureService],
})
export class AdmissionModule {}
