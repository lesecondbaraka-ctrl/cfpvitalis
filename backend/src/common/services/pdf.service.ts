import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';

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
    const qrDataUrl = await QRCode.toDataURL(data.verifyUrl, { width: 120, margin: 1 });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Filigrane
      doc.save();
      doc.rotate(-45, { origin: [300, 400] });
      doc.fontSize(60).fillColor('#823213', 0.08).text('VITALIS CENTER EUP', 50, 350);
      doc.restore();

      // En-tête institutionnel
      doc.rect(50, 50, 495, 8).fill('#823213');
      doc.fontSize(24).fillColor('#823213').font('Helvetica-Bold')
        .text('VITALIS CENTER EUP', 50, 70, { align: 'center' });
      doc.fontSize(10).fillColor('#84580D').font('Helvetica')
        .text('Autorisation Ministérielle N° CFP 00095/MIN-FP/DG-FP/KMG/JPU/2026', { align: 'center' });

      doc.moveDown(2);
      doc.fontSize(28).fillColor('#2D3748').font('Helvetica-Bold')
        .text('CERTIFICAT DE FORMATION', { align: 'center' });
      doc.moveDown(1);

      doc.fontSize(12).fillColor('#2D3748').font('Helvetica')
        .text('Le présent certificat atteste que', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(20).fillColor('#823213').font('Helvetica-Bold')
        .text(`${data.apprenantPrenom} ${data.apprenantNom}`, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#2D3748').font('Helvetica')
        .text('a suivi avec succès la formation', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(16).fillColor('#84580D').font('Helvetica-Bold')
        .text(`« ${data.formationTitre} »`, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#2D3748').font('Helvetica')
        .text(`Établissement : ${data.etablissementNom}`, { align: 'center' });

      doc.moveDown(1.5);
      doc.fontSize(11).text(`Moyenne générale : ${data.moyenne}/20`, { align: 'center' });
      doc.text(`Date d'émission : ${data.dateEmission.toLocaleDateString('fr-FR')}`, { align: 'center' });
      doc.text(`N° de série : ${data.numeroSerie}`, { align: 'center' });

      // QR Code de vérification
      doc.image(qrDataUrl, 430, 650, { width: 100 });
      doc.fontSize(8).fillColor('#84580D')
        .text('Scannez pour vérifier', 420, 755, { width: 120, align: 'center' });

      doc.rect(50, 780, 495, 2).fill('#84580D');
      doc.fontSize(8).fillColor('#2D3748')
        .text('Document officiel — Toute falsification est passible de sanctions.', 50, 790, { align: 'center' });

      doc.end();
    });
  }
}
