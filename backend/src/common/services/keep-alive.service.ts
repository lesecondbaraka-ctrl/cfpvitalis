import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KeepAliveService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KeepAliveService.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const rawUrl =
      this.configService.get<string>('KEEP_ALIVE_URL') ||
      this.configService.get<string>('RENDER_EXTERNAL_URL');

    if (!rawUrl) {
      this.logger.log('KeepAlive: No RENDER_EXTERNAL_URL or KEEP_ALIVE_URL found. Auto-ping idle in local environment.');
      return;
    }

    const cleanBase = rawUrl.replace(/\/$/, '');
    const targetUrl = cleanBase.endsWith('/api/health') || cleanBase.endsWith('/health')
      ? cleanBase
      : `${cleanBase}/api/health`;

    const intervalMinutes = 14;
    const intervalMs = intervalMinutes * 60 * 1000;

    this.logger.log(`KeepAlive: Initialized for ${targetUrl} (every ${intervalMinutes} min)`);

    // Initial ping after 30s
    setTimeout(() => {
      this.ping(targetUrl);
    }, 30_000);

    // Periodic ping
    this.timer = setInterval(() => {
      this.ping(targetUrl);
    }, intervalMs);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async ping(targetUrl: string): Promise<void> {
    try {
      const res = await fetch(targetUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'VitalisCenter-KeepAlive/1.0' },
      });
      if (res.ok) {
        this.logger.log(`[KeepAlive] Ping OK (${res.status}) -> ${targetUrl}`);
      } else {
        this.logger.warn(`[KeepAlive] Ping returned HTTP ${res.status} -> ${targetUrl}`);
      }
    } catch (err: any) {
      this.logger.error(`[KeepAlive] Ping error: ${err.message}`);
    }
  }
}
