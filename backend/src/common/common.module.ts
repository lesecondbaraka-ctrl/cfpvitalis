import { Global, Module } from '@nestjs/common';
import { StorageService } from './services/storage.service';
import { PdfService } from './services/pdf.service';
import { KeepAliveService } from './services/keep-alive.service';

@Global()
@Module({
  providers: [StorageService, PdfService, KeepAliveService],
  exports: [StorageService, PdfService, KeepAliveService],
})
export class CommonModule {}
