import { CertificationService } from './certification.service';
export declare class CertificationController {
    private service;
    constructor(service: CertificationService);
    emettreCertificat(formationId: string, utilisateurId: string, req: any): Promise<{
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
    mesCertificats(req: any): Promise<({
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
    downloadPdf(numeroSerie: string, req: any): Promise<{
        url: string;
        numeroSerie: string;
    }>;
}
