"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
const pedagogie_service_1 = require("../pedagogie/pedagogie.service");
const pdf_service_1 = require("../../common/services/pdf.service");
const storage_service_1 = require("../../common/services/storage.service");
const role_enum_1 = require("../../common/enums/role.enum");
let CertificationService = class CertificationService {
    prisma;
    pedagogieService;
    pdfService;
    storageService;
    config;
    constructor(prisma, pedagogieService, pdfService, storageService, config) {
        this.prisma = prisma;
        this.pedagogieService = pedagogieService;
        this.pdfService = pdfService;
        this.storageService = storageService;
        this.config = config;
    }
    async generateNumeroSerie() {
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
    async emettreCertificat(formationId, utilisateurId, baseUrl) {
        const utilisateur = await this.prisma.utilisateur.findUnique({
            where: { id: utilisateurId },
            include: { etablissement: true },
        });
        if (!utilisateur)
            throw new common_1.NotFoundException('Utilisateur introuvable.');
        const formation = await this.prisma.formation.findUnique({
            where: { id: formationId },
            include: { etablissement: true },
        });
        if (!formation)
            throw new common_1.NotFoundException('Formation introuvable.');
        const existingCert = await this.prisma.certificat.findFirst({
            where: { utilisateurId, formationId },
        });
        if (existingCert) {
            return { success: false, message: 'Un certificat a déjà été émis.', certificat: existingCert };
        }
        const progress = await this.pedagogieService.getProgressByFormation(formationId, utilisateurId);
        if (progress.completionRate < 100) {
            throw new common_1.BadRequestException(`BR-03 : Complétion insuffisante (${progress.completionRate}%). Requis : 100%.`);
        }
        const moyenne = await this.pedagogieService.getMoyennePonderee(formationId, utilisateurId);
        if (moyenne < 10) {
            throw new common_1.BadRequestException(`BR-03 : Moyenne insuffisante (${moyenne}/20). Requis : >= 10/20.`);
        }
        const numeroSerie = await this.generateNumeroSerie();
        const hashVerification = (0, crypto_1.createHash)('sha256')
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
        const urlPdfS3 = await this.storageService.uploadFile(pdfBuffer, `${numeroSerie}.pdf`, 'application/pdf', 'certificats');
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
    async getCertificatsUtilisateur(utilisateurId) {
        return this.prisma.certificat.findMany({
            where: { utilisateurId },
            include: { formation: { select: { titre: true } } },
            orderBy: { dateEmission: 'desc' },
        });
    }
    async verifyCertificat(numeroSerie) {
        const cert = await this.prisma.certificat.findUnique({
            where: { numeroSerie },
            include: {
                utilisateur: { select: { nom: true, prenom: true, email: true } },
                formation: { select: { titre: true, etablissement: { select: { nom: true } } } },
            },
        });
        if (!cert)
            throw new common_1.NotFoundException('Certificat introuvable.');
        return { success: true, valide: true, certificat: cert };
    }
    async getPdfUrl(numeroSerie, user) {
        const cert = await this.prisma.certificat.findUnique({ where: { numeroSerie } });
        if (!cert)
            throw new common_1.NotFoundException('Certificat introuvable.');
        if (user.role === role_enum_1.Role.APPRENANT && cert.utilisateurId !== user.id) {
            throw new common_1.ForbiddenException('Accès interdit.');
        }
        return { url: cert.urlPdfS3, numeroSerie: cert.numeroSerie };
    }
};
exports.CertificationService = CertificationService;
exports.CertificationService = CertificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pedagogie_service_1.PedagogieService,
        pdf_service_1.PdfService,
        storage_service_1.StorageService,
        config_1.ConfigService])
], CertificationService);
//# sourceMappingURL=certification.service.js.map