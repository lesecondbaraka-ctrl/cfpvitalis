import { Global, Module } from '@nestjs/common';
import { StorageService } from './services/storage.service';
import { PdfService } from './services/pdf.service';

@Global()
@Module({
  providers: [StorageService, PdfService],
  exports: [StorageService, PdfService],
})
export class CommonModule {}
