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

  async uploadFile(buffer: Buffer, filename: string, mimeType: string, folder = 'documents'): Promise<string> {
    const key = `${folder}/${randomUUID()}-${filename}`;

    if (this.useLocal) {
      const dir = path.join(this.localDir, folder);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const filePath = path.join(dir, path.basename(key));
      fs.writeFileSync(filePath, buffer);
      return `/uploads/${folder}/${path.basename(key)}`;
    }

    await this.s3Client!.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
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
