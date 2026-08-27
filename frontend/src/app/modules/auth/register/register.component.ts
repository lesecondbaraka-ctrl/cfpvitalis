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
    <section class="bg-[#F5F6F7] min-h-screen flex items-center justify-center p-4 sm:p-8 font-['Public_Sans',sans-serif]">
      <div class="w-full max-w-lg">
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 bg-[#1C75BC] shadow-xs">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold text-[#1B1D1F] tracking-tight">Vitalis Center EUP</h1>
          <p class="text-xs sm:text-sm text-[#4B5157] mt-1">Plateforme Nationale d'Admission & E-Learning</p>
        </div>

        <div class="bg-white border border-[#D7DBDE] border-t-[5px] border-t-[#124F80] p-6 sm:p-8 rounded-[2px] shadow-sm text-center">
          <div class="w-12 h-12 rounded-full bg-[#E7F1FA] text-[#1C75BC] flex items-center justify-center text-xl mx-auto mb-4 border border-[#1C75BC]/30">
            🏛️
          </div>
          
          <h2 class="text-lg font-bold text-[#1B1D1F] mb-2">Enrôlement & Création de Compte</h2>
          
          <p class="text-xs sm:text-sm text-[#4B5157] leading-relaxed mb-6">
            L'ouverture d'un compte apprenant s'effectue exclusivement auprès de votre <strong>établissement de formation agréé</strong> ou par le biais de la <strong>Direction Centrale</strong>.
          </p>

          <div class="p-4 bg-[#E7F1FA] rounded-[2px] border border-[#1C75BC]/30 text-xs text-[#124F80] text-left mb-6 space-y-2">
            <div class="font-bold flex items-center gap-1.5">
              <span>📋 Procédure officielle d'accès :</span>
            </div>
            <ol class="list-decimal list-inside space-y-1 text-[#4B5157] text-[11px] leading-relaxed">
              <li>Adressez-vous au secrétariat de votre centre ou antenne agréée.</li>
              <li>L'administration enregistre votre dossier et crée votre profil officiel.</li>
              <li>Connectez-vous sur la plateforme avec vos identifiants pour postuler aux sessions ouvertes.</li>
            </ol>
          </div>

          <a routerLink="/login" class="btn btn-primary w-full py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs">
            <span>Accéder à la page de connexion</span>
            <span>→</span>
          </a>
        </div>

        <p class="text-center mt-6 text-xs text-[#71787E]">
          © Vitalis Center EUP — Ministère de la Formation Professionnelle
        </p>
      </div>
    </section>
  `,
})
export class RegisterComponent implements OnInit, OnDestroy {
  form = { nom: '', prenom: '', email: '', password: '', etablissementId: '' };
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
