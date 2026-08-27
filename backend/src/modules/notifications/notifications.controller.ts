import { Controller, Sse, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  /**
   * SSE stream — authentifié par JWT.
   * Le frontend doit passer le token via query param `token` car EventSource
   * ne supporte pas les headers Authorization.
   * Ex: new EventSource('/api/notifications/sse?token=<jwt>')
   */
  @UseGuards(JwtAuthGuard)
  @Sse('sse')
  sse(@Req() req: any): Observable<MessageEvent> {
    return this.notifications.stream().pipe(
      map((payload) => ({ data: payload } as unknown as MessageEvent)),
    );
  }
}
