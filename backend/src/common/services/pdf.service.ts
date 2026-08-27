import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import * as path from 'path';
import * as fs from 'fs';

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

@Injectable()
export class PdfService {
  async generateCertificatPdf(data: CertificatPdfData): Promise<Buffer> {
    const qrDataUrl = await QRCode.toDataURL(data.verifyUrl, { width: 110, margin: 1 });

    const logoVitalisPath = path.resolve(__dirname, '../../../../assets/logo-vitalis.png');
    const logoMinisterePath = path.resolve(__dirname, '../../../../assets/logo-ministere.png');

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Filigrane de sécurité
      doc.save();
      doc.rotate(-45, { origin: [300, 400] });
      doc.fontSize(55).fillColor('#1C75BC', 0.05).text('VITALIS CENTER EUP', 40, 350);
      doc.restore();

      // En-tête avec Logos officiels
      let headerTop = 50;
      if (fs.existsSync(logoVitalisPath)) {
        try {
          doc.image(logoVitalisPath, 50, headerTop, { height: 42 });
        } catch (e) {
          console.warn('[PdfService] Impossible de charger le logo Vitalis:', e);
        }
      }
      if (fs.existsSync(logoMinisterePath)) {
        try {
          doc.image(logoMinisterePath, 370, headerTop, { height: 38 });
        } catch (e) {
          console.warn('[PdfService] Impossible de charger le logo Ministère:', e);
        }
      }

      // Barre d'accent signature
      doc.rect(50, 105, 495, 4).fill('#F0791E');

      doc.fontSize(22).fillColor('#1C75BC').font('Helvetica-Bold')
        .text('VITALIS CENTER EUP', 50, 118, { align: 'center' });
      doc.fontSize(9.5).fillColor('#124F80').font('Helvetica-Bold')
        .text("Établissement d'Utilité Publique · Centre de Formation Professionnelle et Technique", { align: 'center' });
      doc.fontSize(8.5).fillColor('#4B5157').font('Helvetica')
        .text('Autorisation Ministérielle N° CFP 00095/MIN-FP/DG-FP/KMG/JPU/2026', { align: 'center' });

      doc.moveDown(1.5);
      doc.fontSize(24).fillColor('#1B1D1F').font('Helvetica-Bold')
        .text('CERTIFICAT DE FORMATION', { align: 'center' });
      doc.moveDown(0.8);

      doc.fontSize(11).fillColor('#4B5157').font('Helvetica')
        .text('Le présent certificat atteste que', { align: 'center' });
      doc.moveDown(0.4);
      doc.fontSize(18).fillColor('#1C75BC').font('Helvetica-Bold')
        .text(`${data.apprenantPrenom} ${data.apprenantNom}`, { align: 'center' });
      doc.moveDown(0.4);
      doc.fontSize(11).fillColor('#4B5157').font('Helvetica')
        .text('a suivi avec succès la formation', { align: 'center' });
      doc.moveDown(0.4);
      doc.fontSize(15).fillColor('#F0791E').font('Helvetica-Bold')
        .text(`« ${data.formationTitre} »`, { align: 'center' });
      doc.moveDown(0.4);
      doc.fontSize(10.5).fillColor('#1B1D1F').font('Helvetica')
        .text(`Établissement : ${data.etablissementNom}`, { align: 'center' });

      doc.moveDown(1.2);
      doc.fontSize(10.5).text(`Moyenne générale : ${data.moyenne}/20`, { align: 'center' });
      doc.text(`Date d'émission : ${data.dateEmission.toLocaleDateString('fr-FR')}`, { align: 'center' });
      doc.fontSize(10.5).fillColor('#1C75BC').font('Helvetica-Bold')
        .text(`N° de série inaltérable : ${data.numeroSerie}`, { align: 'center' });

      // QR Code de vérification publique
      doc.image(qrDataUrl, 440, 640, { width: 95 });
      doc.fontSize(7.5).fillColor('#124F80').font('Helvetica-Bold')
        .text('Scannez pour vérifier', 430, 740, { width: 115, align: 'center' });

      // Pied de page officiel
      doc.rect(50, 770, 495, 2).fill('#F0791E');
      doc.fontSize(7.5).fillColor('#4B5157').font('Helvetica')
        .text('Document officiel délivré sous contrôle du Ministère de la Formation Professionnelle — RDC. Toute falsification est passible de poursuites.', 50, 780, { align: 'center' });

      doc.end();
    });
  }
}
