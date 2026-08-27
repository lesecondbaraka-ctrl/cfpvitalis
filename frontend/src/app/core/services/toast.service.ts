import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';
export interface ToastItem { id: string; type: ToastType; message: string; duration?: number }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private subject = new BehaviorSubject<ToastItem[]>([]);
  toasts$: Observable<ToastItem[]> = this.subject.asObservable();

  show(message: string, type: ToastType = 'info', duration = 6000) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
    const item: ToastItem = { id, type, message, duration };
    const list = [...this.subject.value, item];
    this.subject.next(list);
    if (duration && duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  success(message: string, duration = 5000) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 6000) {
    this.show(message, 'error', duration);
  }

  info(message: string, duration = 5000) {
    this.show(message, 'info', duration);
  }

  dismiss(id: string) {
    this.subject.next(this.subject.value.filter(t => t.id !== id));
  }

  clear() { this.subject.next([]); }
}
