import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { EtablissementsService } from '../../../core/services/etablissements.service';
import { Etablissement } from '../../../core/models';
import { NotificationsService } from '../../../core/services/notifications.service';
import { ToastService } from '../../../core/services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="bg-vc-bg min-h-screen flex items-center justify-center p-8">
      <div class="w-full max-w-lg">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-vc-primary font-heading">Inscription</h1>
          <p class="text-vc-text text-sm">Vitalis Center EUP</p>
        </div>
        <div class="card">
            <!-- Inline notification removed: using global ToastService/ToastComponent instead -->
          <form (ngSubmit)="onSubmit()" #f="ngForm">
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div><label class="form-label">Nom</label><input class="form-input" name="nom" [(ngModel)]="form.nom" required /></div>
              <div><label class="form-label">Prénom</label><input class="form-input" name="prenom" [(ngModel)]="form.prenom" required /></div>
            </div>
            <div class="mb-4"><label class="form-label">Email</label><input class="form-input" type="email" name="email" [(ngModel)]="form.email" required /></div>
            <div class="mb-4"><label class="form-label">Mot de passe</label><input class="form-input" type="password" name="password" [(ngModel)]="form.password" required minlength="8" /></div>
            <div class="mb-4">
              <label class="form-label">Rôle</label>
              <select class="form-input" name="role" [(ngModel)]="form.role" required>
                <option value="APPRENANT">Apprenant</option>
                <option value="FORMATEUR">Formateur</option>
                <option value="PERSONNEL_ADMINISTRATIF">Personnel Administratif</option>
                <option value="ADMIN_ETABLISSEMENT">Admin Établissement</option>
              </select>
            </div>
            <div class="mb-6">
              <label class="form-label">Établissement (BR-01)</label>
              <select class="form-input" name="etablissementId" [(ngModel)]="form.etablissementId" required>
                @for (e of etablissements; track e.id) {
                  <option [value]="e.id">{{ e.nom }}</option>
                }
              </select>
            </div>
            <button class="btn btn-primary w-full" type="submit" [disabled]="loading || f.invalid">{{ loading ? 'Inscription...' : "S'inscrire" }}</button>
            <p class="text-center mt-4 text-sm">Déjà inscrit ? <a routerLink="/login" class="font-bold">Se connecter</a></p>
          </form>
        </div>
      </div>
    </section>
  `,
})
export class RegisterComponent implements OnInit, OnDestroy {
  form = { nom: '', prenom: '', email: '', password: '', role: 'APPRENANT', etablissementId: '' };
  etablissements: Etablissement[] = [];
  loading = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | '' = '';
  private notificationTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private notifSub: Subscription | null = null;

  ngOnDestroy() {
    if (this.notifSub) this.notifSub.unsubscribe();
    if (this.notificationTimeoutId) { clearTimeout(this.notificationTimeoutId); this.notificationTimeoutId = null; }
  }

  constructor(private authService: AuthService, private etabService: EtablissementsService, private notifications: NotificationsService, private toast: ToastService) {}

  ngOnInit() {
    this.etabService.getPublicList().subscribe({
      next: (e) => { this.etablissements = e; if (e.length) this.form.etablissementId = e[0].id; },
    });
    this.notifSub = this.notifications.messages().subscribe({
      next: (m) => {
        if (m && m.type === 'auth') { this.showNotification(m.event === 'register' ? 'success' : 'success', m.message || 'Notification'); }
      },
      error: () => {},
    });
  }

  private showNotification(type: 'success' | 'error', message: string) {
    try { this.toast.show(message, type); } catch {}
    this.notificationType = type;
    this.notificationMessage = message;
    if (this.notificationTimeoutId) {
      clearTimeout(this.notificationTimeoutId);
    }
    this.notificationTimeoutId = setTimeout(() => {
      this.notificationMessage = '';
      this.notificationType = '';
      this.notificationTimeoutId = null;
    }, 6000);
  }

  dismissNotification() {
    if (this.notificationTimeoutId) { clearTimeout(this.notificationTimeoutId); this.notificationTimeoutId = null; }
    this.notificationMessage = '';
    this.notificationType = '';
  }

  onSubmit() {
    this.loading = true;
    this.notificationMessage = '';
    this.notificationType = '';
    this.authService.register(this.form).subscribe({
      next: () => {
        this.showNotification('success', 'Inscription réussie ! Vous pouvez maintenant vous connecter.');
        this.loading = false;
      },
      error: (e) => {
        this.showNotification('error', e.error?.message || 'Erreur lors de l’inscription.');
        this.loading = false;
      },
    });
  }
}
