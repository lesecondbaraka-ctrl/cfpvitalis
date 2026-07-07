import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="position:fixed;right:16px;top:16px;z-index:99999;display:flex;flex-direction:column;gap:10px;">
      <div *ngFor="let t of toasts | async" [attr.data-id]="t.id" [style.background]="t.type==='success'? 'rgba(236,253,245,0.98)' : 'rgba(254,242,242,0.98)'"
           style="min-width:260px;max-width:380px;padding:12px 16px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.12);border:1px solid rgba(0,0,0,0.04);display:flex;justify-content:space-between;align-items:center;gap:12px;color:#111;">
        <div style="display:flex;align-items:center;gap:10px;flex:1">
          <div style="font-weight:700">{{ t.type === 'success' ? '✅' : t.type === 'error' ? '⚠️' : 'ℹ️' }}</div>
          <div style="flex:1">{{ t.message }}</div>
        </div>
        <button (click)="dismiss(t.id)" style="background:transparent;border:none;font-size:16px;cursor:pointer">✕</button>
      </div>
    </div>
  `,
})
export class ToastComponent {
  toasts = this.toast.toasts$;
  constructor(private toast: ToastService) {}
  dismiss(id: string) { this.toast.dismiss(id); }
}
