import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class NotificationsService {
  private subject = new Subject<any>();

  emit(payload: any) {
    this.subject.next(payload);
  }

  stream(): Observable<any> {
    return this.subject.asObservable();
  }
}
