import { Injectable, OnDestroy, NgZone } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationsService implements OnDestroy {
  private subject = new ReplaySubject<any>(1);
  private es: EventSource | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: any = null;

  constructor(private ngZone: NgZone) {}

  connect() {
    if (this.es) return;
    const token = localStorage.getItem('vitalis_token');
    if (!token) return;
    const url = `${environment.apiUrl}/notifications/sse?token=${encodeURIComponent(token)}`;
    this.es = new EventSource(url);
    this.es.onopen = () => { this.reconnectAttempts = 0; if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null; } };
    this.es.onmessage = (e) => {
      // run inside Angular zone so subscribers trigger change detection
      this.ngZone.run(() => {
        try {
          this.subject.next(JSON.parse(e.data));
        } catch {
          this.subject.next(e.data);
        }
      });
    };
    this.es.onerror = (err) => {
      this.ngZone.run(() => {
        // close connection but do NOT error the subject to avoid terminating subscribers
        this.close();
        // exponential backoff reconnect
        this.reconnectAttempts = Math.min(10, this.reconnectAttempts + 1);
        const delay = Math.min(30000, 500 * Math.pow(2, this.reconnectAttempts));
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => { try { this.connect(); } catch {} }, delay);
      });
    };
  }

  messages(): Observable<any> {
    this.connect();
    return this.subject.asObservable();
  }

  close() {
    if (this.es) { this.es.close(); this.es = null; }
    if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
  }

  ngOnDestroy() {
    this.close();
    this.subject.complete();
  }
}
