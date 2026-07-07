import { Controller, Sse } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Public()
  @Sse('sse')
  sse(): Observable<MessageEvent> {
    return this.notifications.stream().pipe(map((payload) => ({ data: payload } as unknown as MessageEvent)));
  }
}
