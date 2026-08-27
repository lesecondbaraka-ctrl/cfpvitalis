import { Request } from 'express';

export const ALLOWED_UPLOAD_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'text/plain',
];

export const MAX_UPLOAD_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function uploadFileFilter(
  _req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) {
  if (!ALLOWED_UPLOAD_MIME_TYPES.includes(file.mimetype)) {
    return callback(new Error('Type de fichier non supporté.'), false);
  }
  callback(null, true);
}
