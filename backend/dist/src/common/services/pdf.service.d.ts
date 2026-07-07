export interface CertificatPdfData {
    numeroSerie: string;
    apprenantNom: string;
    apprenantPrenom: string;
    formationTitre: string;
    etablissementNom: string;
    moyenne: number;
    dateEmission: Date;
    verifyUrl: string;
}
export declare class PdfService {
    generateCertificatPdf(data: CertificatPdfData): Promise<Buffer>;
}
