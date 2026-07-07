import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PedagogieService } from '../pedagogie/pedagogie.service';
import { PdfService } from '../../common/services/pdf.service';
import { StorageService } from '../../common/services/storage.service';
export declare class CertificationService {
    private prisma;
    private pedagogieService;
    private pdfService;
    private storageService;
    private config;
    constructor(prisma: PrismaService, pedagogieService: PedagogieService, pdfService: PdfService, storageService: StorageService, config: ConfigService);
    private generateNumeroSerie;
    emettreCertificat(formationId: string, utilisateurId: string, baseUrl: string): Promise<{
        success: boolean;
        message: string;
        certificat: {
            id: string;
            formationId: string;
            utilisateurId: string;
            numeroSerie: string;
            hashVerification: string;
            urlPdfS3: string;
            moyenneGenerale: import("@prisma/client-runtime-utils").Decimal;
            dateEmission: Date | null;
        };
        verifyUrl?: undefined;
        details?: undefined;
    } | {
        success: boolean;
        message: string;
        certificat: {
            id: string;
            formationId: string;
            utilisateurId: string;
            numeroSerie: string;
            hashVerification: string;
            urlPdfS3: string;
            moyenneGenerale: import("@prisma/client-runtime-utils").Decimal;
            dateEmission: Date | null;
        };
        verifyUrl: string;
        details: {
            completionRate: number;
            moyenne: number;
        };
    }>;
    getCertificatsUtilisateur(utilisateurId: string): Promise<({
        formation: {
            titre: string;
        };
    } & {
        id: string;
        formationId: string;
        utilisateurId: string;
        numeroSerie: string;
        hashVerification: string;
        urlPdfS3: string;
        moyenneGenerale: import("@prisma/client-runtime-utils").Decimal;
        dateEmission: Date | null;
    })[]>;
    verifyCertificat(numeroSerie: string): Promise<{
        success: boolean;
        valide: boolean;
        certificat: {
            utilisateur: {
                nom: string;
                email: string;
                prenom: string;
            };
            formation: {
                etablissement: {
                    nom: string;
                };
                titre: string;
            };
        } & {
            id: string;
            formationId: string;
            utilisateurId: string;
            numeroSerie: string;
            hashVerification: string;
            urlPdfS3: string;
            moyenneGenerale: import("@prisma/client-runtime-utils").Decimal;
            dateEmission: Date | null;
        };
    }>;
    getPdfUrl(numeroSerie: string, user: any): Promise<{
        url: string;
        numeroSerie: string;
    }>;
}
