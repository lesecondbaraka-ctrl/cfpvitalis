import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ToastItem, ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="vc-toast-root" aria-live="polite" aria-atomic="true">
      <div *ngFor="let t of toasts$ | async" [attr.data-id]="t.id" class="vc-toast-item {{ t.type }}">
        <div style="display:flex;align-items:center;gap:10px;flex:1">
          <div style="font-weight:700">{{ t.type === 'success' ? '✅' : t.type === 'error' ? '⚠️' : 'ℹ️' }}</div>
          <div style="flex:1">{{ t.message }}</div>
        </div>
        <button (click)="dismiss(t.id)" class="vc-toast-close">✕</button>
      </div>
    </div>
  `,
})
export class ToastComponent {
  toasts$: Observable<ToastItem[]>;
  constructor(private toast: ToastService) {
    this.toasts$ = this.toast.toasts$;
  }
  dismiss(id: string) { this.toast.dismiss(id); }
}
