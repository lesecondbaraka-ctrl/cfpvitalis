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
import { PdfService } from '../../common/services/pdf.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';

@Controller('apprenant')
@UseGuards(JwtAuthGuard, EtablissementGuard, RolesGuard)
@Roles(Role.APPRENANT)
export class ApprenantController {
  constructor(
    private service: ApprenantService,
    private storage: StorageService,
    private pdfService: PdfService,
    private prisma: PrismaService,
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
   * GET /apprenant/certificats/:id/telecharger (et alias :id/download)
   * Stream binaire direct du PDF officiel vers l'appareil de l'apprenant (id UUID ou numeroSerie)
   */
  @Get('certificats/:id/telecharger')
  async telechargerCertificat(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    return this.streamPdf(id, req, res);
  }

  @Get('certificats/:id/download')
  async downloadCertificat(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    return this.streamPdf(id, req, res);
  }

  private async streamPdf(id: string, req: any, res: Response) {
    const cert: any = await this.service.getCertificatPdf(id, req.user);
    const localPath = cert.urlPdfS3 ? this.storage.getLocalPath(cert.urlPdfS3) : null;

    // 1. Si le fichier physique existe déjà sur disque, le streamer directement
    if (localPath && fs.existsSync(localPath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${cert.numeroSerie}.pdf"`);
      return fs.createReadStream(localPath).pipe(res);
    }

    // 2. Si le document n'est pas encore sur le disque local (seed/mock), le générer à la volée avec le sceau et QR Code
    const baseUrl = req.headers.origin || 'http://localhost:4200';
    const verifyUrl = `${baseUrl}/certificats/verifier/${cert.numeroSerie}`;

    const pdfBuffer = await this.pdfService.generateCertificatPdf({
      numeroSerie: cert.numeroSerie,
      apprenantNom: cert.utilisateur?.nom || 'Apprenant',
      apprenantPrenom: cert.utilisateur?.prenom || '',
      formationTitre: cert.formation?.titre || 'Formation Professionnelle',
      etablissementNom: cert.formation?.etablissement?.nom || 'Vitalis Center EUP',
      moyenne: Number(cert.moyenneGenerale) || 10,
      dateEmission: cert.dateEmission ? new Date(cert.dateEmission) : new Date(),
      verifyUrl,
    });

    // Sauvegarde sur le stockage local pour les futurs téléchargements instantanés
    try {
      const savedPath = await this.storage.uploadFile(
        pdfBuffer,
        `${cert.numeroSerie}.pdf`,
        'application/pdf',
        'certificats',
      );
      if (!cert.urlPdfS3 || cert.urlPdfS3.includes('vitalis-center.eup')) {
        await this.prisma.certificat.update({
          where: { id: cert.id },
          data: { urlPdfS3: savedPath },
        });
      }
    } catch (saveErr) {
      // Poursuivre l'envoi même si la mise en cache disque rencontre une contrainte
    }

    // 3. Envoyer directement le flux binaire PDF au navigateur (déclenche le téléchargement fichier réel)
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', `attachment; filename="${cert.numeroSerie}.pdf"`);
    return res.end(pdfBuffer);
  }
}
