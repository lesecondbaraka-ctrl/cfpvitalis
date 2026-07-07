import { ConfigService } from '@nestjs/config';
export declare class StorageService {
    private config;
    private readonly logger;
    private s3Client;
    private bucket;
    private useLocal;
    private localDir;
    constructor(config: ConfigService);
    uploadFile(buffer: Buffer, filename: string, mimeType: string, folder?: string): Promise<string>;
    getLocalPath(relativeUrl: string): string | null;
}
