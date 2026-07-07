import { Observable } from 'rxjs';
export declare class NotificationsService {
    private subject;
    emit(payload: any): void;
    stream(): Observable<any>;
}
