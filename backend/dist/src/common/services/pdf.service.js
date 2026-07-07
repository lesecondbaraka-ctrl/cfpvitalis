"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const pdfkit_1 = __importDefault(require("pdfkit"));
const QRCode = __importStar(require("qrcode"));
let PdfService = class PdfService {
    async generateCertificatPdf(data) {
        const qrDataUrl = await QRCode.toDataURL(data.verifyUrl, { width: 120, margin: 1 });
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ size: 'A4', margin: 50 });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            doc.save();
            doc.rotate(-45, { origin: [300, 400] });
            doc.fontSize(60).fillColor('#823213', 0.08).text('VITALIS CENTER EUP', 50, 350);
            doc.restore();
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
            doc.image(qrDataUrl, 430, 650, { width: 100 });
            doc.fontSize(8).fillColor('#84580D')
                .text('Scannez pour vérifier', 420, 755, { width: 120, align: 'center' });
            doc.rect(50, 780, 495, 2).fill('#84580D');
            doc.fontSize(8).fillColor('#2D3748')
                .text('Document officiel — Toute falsification est passible de sanctions.', 50, 790, { align: 'center' });
            doc.end();
        });
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)()
], PdfService);
//# sourceMappingURL=pdf.service.js.map