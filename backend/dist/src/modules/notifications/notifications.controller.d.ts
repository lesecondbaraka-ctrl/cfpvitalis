import { Observable } from 'rxjs';
import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notifications;
    constructor(notifications: NotificationsService);
    sse(): Observable<MessageEvent>;
}
