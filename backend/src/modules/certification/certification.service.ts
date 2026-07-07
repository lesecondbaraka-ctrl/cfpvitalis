import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { PedagogieService } from '../pedagogie/pedagogie.service';
import { PdfService } from '../../common/services/pdf.service';
import { StorageService } from '../../common/services/storage.service';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class CertificationService {
  constructor(
    private prisma: PrismaService,
    private pedagogieService: PedagogieService,
    private pdfService: PdfService,
    private storageService: StorageService,
    private config: ConfigService,
  ) {}

  private async generateNumeroSerie(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CERT-${year}-`;
    const lastCert = await this.prisma.certificat.findFirst({
      where: { numeroSerie: { startsWith: prefix } },
      orderBy: { numeroSerie: 'desc' },
    });
    let nextNumber = 1;
    if (lastCert) {
      nextNumber = parseInt(lastCert.numeroSerie.replace(prefix, ''), 10) + 1;
    }
    return `${prefix}${String(nextNumber).padStart(5, '0')}`;
  }

  async emettreCertificat(formationId: string, utilisateurId: string, baseUrl: string) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { id: utilisateurId },
      include: { etablissement: true },
    });
    if (!utilisateur) throw new NotFoundException('Utilisateur introuvable.');

    const formation = await this.prisma.formation.findUnique({
      where: { id: formationId },
      include: { etablissement: true },
    });
    if (!formation) throw new NotFoundException('Formation introuvable.');

    const existingCert = await this.prisma.certificat.findFirst({
      where: { utilisateurId, formationId },
    });
    if (existingCert) {
      return { success: false, message: 'Un certificat a déjà été émis.', certificat: existingCert };
    }

    const progress = await this.pedagogieService.getProgressByFormation(formationId, utilisateurId);
    if (progress.completionRate < 100) {
      throw new BadRequestException(
        `BR-03 : Complétion insuffisante (${progress.completionRate}%). Requis : 100%.`,
      );
    }

    const moyenne = await this.pedagogieService.getMoyennePonderee(formationId, utilisateurId);
    if (moyenne < 10) {
      throw new BadRequestException(`BR-03 : Moyenne insuffisante (${moyenne}/20). Requis : >= 10/20.`);
    }

    const numeroSerie = await this.generateNumeroSerie();
    const hashVerification = createHash('sha256')
      .update(`${utilisateurId}-${formationId}-${numeroSerie}-${Date.now()}`)
      .digest('hex');

    const verifyUrl = `${baseUrl}/certificats/verifier/${numeroSerie}`;
    const pdfBuffer = await this.pdfService.generateCertificatPdf({
      numeroSerie,
      apprenantNom: utilisateur.nom,
      apprenantPrenom: utilisateur.prenom,
      formationTitre: formation.titre,
      etablissementNom: formation.etablissement.nom,
      moyenne,
      dateEmission: new Date(),
      verifyUrl,
    });

    const urlPdfS3 = await this.storageService.uploadFile(
      pdfBuffer,
      `${numeroSerie}.pdf`,
      'application/pdf',
      'certificats',
    );

    const certificat = await this.prisma.certificat.create({
      data: {
        numeroSerie,
        utilisateurId,
        formationId,
        moyenneGenerale: moyenne,
        hashVerification,
        urlPdfS3,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        auteurId: utilisateurId,
        action: 'EMISSION_CERTIFICAT',
        ipAdresse: '0.0.0.0',
        tableCible: 'certificats',
        details: { certificat: numeroSerie, formation: formation.titre, moyenne },
      },
    });

    return {
      success: true,
      message: `Certificat émis : ${numeroSerie}`,
      certificat,
      verifyUrl,
      details: { completionRate: progress.completionRate, moyenne },
    };
  }

  async getCertificatsUtilisateur(utilisateurId: string) {
    return this.prisma.certificat.findMany({
      where: { utilisateurId },
      include: { formation: { select: { titre: true } } },
      orderBy: { dateEmission: 'desc' },
    });
  }

  async verifyCertificat(numeroSerie: string) {
    const cert = await this.prisma.certificat.findUnique({
      where: { numeroSerie },
      include: {
        utilisateur: { select: { nom: true, prenom: true, email: true } },
        formation: { select: { titre: true, etablissement: { select: { nom: true } } } },
      },
    });
    if (!cert) throw new NotFoundException('Certificat introuvable.');
    return { success: true, valide: true, certificat: cert };
  }

  async getPdfUrl(numeroSerie: string, user: any) {
    const cert = await this.prisma.certificat.findUnique({ where: { numeroSerie } });
    if (!cert) throw new NotFoundException('Certificat introuvable.');
    if (user.role === Role.APPRENANT && cert.utilisateurId !== user.id) {
      throw new ForbiddenException('Accès interdit.');
    }
    return { url: cert.urlPdfS3, numeroSerie: cert.numeroSerie };
  }
}
