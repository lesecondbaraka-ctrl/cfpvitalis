import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client | null = null;
  private bucket: string;
  private useLocal: boolean;
  private localDir: string;

  constructor(private config: ConfigService) {
    this.bucket = this.config.get('S3_BUCKET', 'vitalis-center');
    this.useLocal = this.config.get('STORAGE_MODE', 'local') === 'local';
    this.localDir = path.join(process.cwd(), 'uploads');

    if (!this.useLocal) {
      this.s3Client = new S3Client({
        region: this.config.get('AWS_REGION', 'eu-west-3'),
        credentials: {
          accessKeyId: this.config.get('AWS_ACCESS_KEY_ID', ''),
          secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY', ''),
        },
        endpoint: this.config.get('S3_ENDPOINT'),
        forcePathStyle: true,
      });
    } else if (!fs.existsSync(this.localDir)) {
      fs.mkdirSync(this.localDir, { recursive: true });
    }
  }

  private sanitizeFilename(filename: string): string {
    const ext = path.extname(filename).toLowerCase().replace(/[^a-z0-9.]/g, '').slice(0, 10);
    const nameWithoutExt = path.basename(filename, ext);
    const sanitizedBase = nameWithoutExt
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_{2,}/g, '_')
      .slice(0, 60);
    return `${sanitizedBase || 'fichier'}${ext}`;
  }

  private validateBufferMagicBytes(buffer: Buffer, mimeType: string): boolean {
    if (!buffer || buffer.length === 0) return false;

    // PDF: %PDF (0x25, 0x50, 0x44, 0x46)
    if (mimeType === 'application/pdf') {
      return buffer.length >= 4 && buffer.slice(0, 4).toString() === '%PDF';
    }
    // PNG: 0x89 50 4E 47
    if (mimeType === 'image/png') {
      return buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    }
    // JPEG: 0xFF D8 FF
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
      return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }
    // WebP: RIFF .... WEBP
    if (mimeType === 'image/webp') {
      return buffer.length >= 12 && buffer.slice(0, 4).toString() === 'RIFF' && buffer.slice(8, 12).toString() === 'WEBP';
    }
    // GIF: GIF87a or GIF89a
    if (mimeType === 'image/gif') {
      return buffer.length >= 4 && buffer.slice(0, 4).toString() === 'GIF8';
    }
    // MP4 / QuickTime: ftyp at offset 4
    if (mimeType === 'video/mp4' || mimeType === 'video/quicktime') {
      return buffer.length >= 8 && buffer.slice(4, 8).toString() === 'ftyp';
    }
    // DOCX (ZIP archive): PK\x03\x04
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return buffer.length >= 2 && buffer[0] === 0x50 && buffer[1] === 0x4b;
    }
    // DOC (OLE2): 0xD0 CF 11 E0
    if (mimeType === 'application/msword') {
      return buffer.length >= 2 && buffer[0] === 0xd0 && buffer[1] === 0xcf;
    }
    return true; // text/plain, etc.
  }

  async uploadFile(buffer: Buffer, filename: string, mimeType: string, folder = 'documents'): Promise<string> {
    if (!this.validateBufferMagicBytes(buffer, mimeType)) {
      throw new Error('Échec de la validation de sécurité : la signature binaire du fichier ne correspond pas au type MIME déclaré.');
    }

    const safeFilename = this.sanitizeFilename(filename);
    const safeFolder = folder.replace(/[^a-zA-Z0-9_\-\/]/g, '').replace(/\.\./g, '');
    const uniqueName = `${randomUUID()}-${safeFilename}`;
    const key = `${safeFolder}/${uniqueName}`;

    if (this.useLocal) {
      const dir = path.join(this.localDir, safeFolder);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const filePath = path.join(dir, uniqueName);
      fs.writeFileSync(filePath, buffer);
      return `/uploads/${safeFolder}/${uniqueName}`;
    }

    await this.s3Client!.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ServerSideEncryption: 'AES256',
      }),
    );
    const endpoint = this.config.get('S3_PUBLIC_URL', `https://${this.bucket}.s3.amazonaws.com`);
    return `${endpoint}/${key}`;
  }

  getLocalPath(relativeUrl: string): string | null {
    if (!relativeUrl.startsWith('/uploads/')) return null;
    return path.join(process.cwd(), relativeUrl.replace(/^\//, ''));
  }
}
