import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EtablissementGuard } from '../../common/guards/etablissement.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { ApprenantService } from './apprenant.service';
import { SubmitApprenantQuizDto } from './dto/apprenant.dto';
import { uploadFileFilter, MAX_UPLOAD_FILE_SIZE } from '../../common/utils/file-upload.util';
import { StorageService } from '../../common/services/storage.service';
import * as fs from 'fs';

@Controller('apprenant')
@UseGuards(JwtAuthGuard, EtablissementGuard, RolesGuard)
@Roles(Role.APPRENANT)
export class ApprenantController {
  constructor(
    private service: ApprenantService,
    private storage: StorageService,
  ) {}

  /**
   * GET /apprenant/dashboard
   * Agrégat : formations actives, % complétion global, prochaine échéance
   */
  @Get('dashboard')
  getDashboard(@Req() req: any) {
    return this.service.getDashboard(req.user);
  }

  /**
   * GET /apprenant/formations
   * Formations affectées (filtrées tenant + inscription)
   */
  @Get('formations')
  getFormations(@Req() req: any) {
    return this.service.getFormations(req.user);
  }

  /**
   * GET /apprenant/formations/:id/modules
   * Arborescence modules/cours + statut progression
   */
  @Get('formations/:id/modules')
  getFormationModules(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.service.getFormationModules(id, req.user);
  }

  /**
   * GET /apprenant/formations/:id/eligibilite-certificat
   * Règle BR-03 : Éligibilité certificat (100% cours + moyenne >= 10/20)
   */
  @Get('formations/:id/eligibilite-certificat')
  getEligibiliteCertificat(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.service.checkEligibiliteCertificat(id, req.user);
  }

  /**
   * GET /apprenant/cours/:id/contenu
   * Contenu et média sécurisé du cours
   */
  @Get('cours/:id/contenu')
  getCoursContenu(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.service.getCoursContenu(id, req.user);
  }

  /**
   * POST /apprenant/cours/:id/progression
   * Marque un cours comme lu / terminé (déclenche recalcul % module et formation)
   */
  @Post('cours/:id/progression')
  markCoursProgression(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.service.markCoursProgression(id, req.user);
  }

  /**
   * GET /apprenant/quiz/:id
   * Récupère les questions (sans les bonnes réponses pour sécuriser le quiz)
   */
  @Get('quiz/:id')
  getQuiz(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.service.getQuiz(id, req.user);
  }

  /**
   * POST /apprenant/quiz/:id/soumettre
   * Enregistre TentativeQuiz, calcule score côté serveur uniquement
   */
  @Post('quiz/:id/soumettre')
  submitQuiz(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitApprenantQuizDto,
    @Req() req: any,
  ) {
    return this.service.submitQuiz(id, dto.reponses, req.user);
  }

  /**
   * POST /apprenant/devoirs/:id/deposer
   * Upload S3 (multipart), crée ou met à jour Soumission
   */
  @Post('devoirs/:id/deposer')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: uploadFileFilter,
      limits: { fileSize: MAX_UPLOAD_FILE_SIZE },
    }),
  )
  deposerDevoir(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.service.deposerDevoir(id, file, req.user);
  }

  /**
   * GET /apprenant/devoirs
   * Agrégat optimisé : tous les devoirs de l'apprenant en une seule requête SQL
   */
  @Get('devoirs')
  getAllDevoirs(@Req() req: any) {
    return this.service.getAllDevoirs(req.user);
  }

  /**
   * GET /apprenant/certificats
   * Liste des certificats obtenus
   */
  @Get('certificats')
  getCertificats(@Req() req: any) {
    return this.service.getCertificats(req.user);
  }

  /**
   * GET /apprenant/certificats/:id/telecharger
   * Stream ou URL de téléchargement du PDF officiel
   */
  @Get('certificats/:id/telecharger')
  async telechargerCertificat(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const cert = await this.service.getCertificatPdf(id, req.user);
    const localPath = this.storage.getLocalPath(cert.urlPdf);

    if (localPath && fs.existsSync(localPath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${cert.numeroSerie}.pdf"`);
      return fs.createReadStream(localPath).pipe(res);
    }

    return res.json({
      url: cert.urlPdf,
      numeroSerie: cert.numeroSerie,
    });
  }
}
