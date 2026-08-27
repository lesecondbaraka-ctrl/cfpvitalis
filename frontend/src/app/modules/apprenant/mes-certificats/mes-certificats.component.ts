import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApprenantService, ApprenantCertificat } from '../../../core/services/apprenant.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-mes-certificats',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-8 animate-fade-in pb-12">
      <!-- HEADER -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-[#1B1D1F] font-heading">Mes Certificats Officiels</h1>
          <div class="barre"></div>
          <p class="text-xs text-[#4B5157] mt-2">
            Titres professionnels et certificats d'aptitude délivrés sous la tutelle du Ministère de la Formation Professionnelle.
          </p>
        </div>
      </div>

      @if (loading) {
        <div class="p-16 text-center text-[#4B5157] bg-white border border-[#D7DBDE] rounded-xs">
          <div class="inline-block w-8 h-8 border-3 border-[#1C75BC] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p class="text-xs font-semibold text-[#4B5157]">Vérification de vos certificats...</p>
        </div>
      } @else if (certificats.length === 0) {
        <div class="p-12 text-center bg-white border border-[#D7DBDE] rounded-xs text-[#4B5157] space-y-4 shadow-xs">
          <div class="w-16 h-16 rounded-xs bg-[#FDECDD] text-[#F0791E] flex items-center justify-center mx-auto border border-[#F0791E]/30">
            <svg class="w-8 h-8 text-[#F0791E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div class="space-y-1">
            <h3 class="text-base font-bold text-[#1B1D1F]">Aucun certificat émis pour le moment</h3>
            <p class="text-xs text-[#4B5157] max-w-md mx-auto leading-relaxed">
              Pour obtenir votre certificat officiel, vous devez terminer 100% des modules de votre formation et obtenir une moyenne pondérée $\ge$ 10/20 (Règle BR-03).
            </p>
          </div>
          <a
            routerLink="/apprenant/formations"
            class="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xs bg-[#1C75BC] hover:bg-[#124F80] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <span>Poursuivre mon apprentissage</span>
            <span>→</span>
          </a>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (c of certificats; track c.id) {
            <div class="p-6 md:p-8 bg-white border border-[#D7DBDE] hover:border-[#1C75BC] transition-all space-y-6 relative overflow-hidden flex flex-col justify-between rounded-xs border-t-4 border-t-[#F0791E] shadow-xs">
              <div class="space-y-4">
                <div class="flex items-center justify-between gap-2">
                  <span class="px-3 py-1 rounded-xs bg-[#FDECDD] border border-[#F0791E] text-[#F0791E] text-[11px] font-bold tracking-wider font-mono">
                    N° {{ c.numeroSerie }}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-xs bg-[#E7F1EA] text-[#276B44] border border-[#276B44] text-[10px] font-bold flex items-center gap-1">
                    <svg class="w-3.5 h-3.5 text-[#276B44]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Authentifié · EUP</span>
                  </span>
                </div>

                <div>
                  <h2 class="text-lg font-bold text-[#1B1D1F] leading-snug">{{ c.formation.titre }}</h2>
                  <p class="text-xs text-[#4B5157] mt-1">
                    Délivré par {{ c.formation.etablissement.nom || 'Vitalis Center EUP' }}
                  </p>
                </div>

                <div class="grid grid-cols-2 gap-3 p-4 bg-[#F5F6F7] border border-[#D7DBDE] rounded-xs text-xs">
                  <div>
                    <span class="text-[10px] text-[#4B5157] uppercase font-bold">Moyenne Générale</span>
                    <p class="text-base font-black text-[#1B1D1F] mt-0.5 font-mono">{{ c.moyenneGenerale }} / 20</p>
                  </div>
                  <div>
                    <span class="text-[10px] text-[#4B5157] uppercase font-bold">Date d'Émission</span>
                    <p class="text-xs font-bold text-[#1B1D1F] mt-1 font-mono">{{ c.dateEmission | date:'dd MMMM yyyy' }}</p>
                  </div>
                </div>

                <div class="space-y-1 text-[10px] text-[#4B5157] bg-[#F5F6F7] p-3 rounded-xs border border-[#D7DBDE]">
                  <span class="font-mono font-bold text-[#1B1D1F]">Hash anti-fraude SHA-256 :</span>
                  <p class="font-mono text-[#4B5157] truncate text-[9px]">{{ c.hashVerification }}</p>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-3 pt-4 border-t border-[#D7DBDE]">
                <a
                  [href]="c.urlPdfS3"
                  target="_blank"
                  class="flex-1 px-4 py-2.5 rounded-xs bg-[#1C75BC] hover:bg-[#124F80] text-white text-xs font-bold text-center shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Télécharger PDF</span>
                </a>

                <a
                  [routerLink]="['/certificats/verifier', c.numeroSerie]"
                  target="_blank"
                  class="px-4 py-2.5 rounded-xs bg-[#F5F6F7] hover:bg-[#D7DBDE] text-[#1B1D1F] border border-[#D7DBDE] text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <svg class="w-4 h-4 text-[#1C75BC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Vérifier</span>
                </a>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class MesCertificatsComponent implements OnInit {
  certificats: ApprenantCertificat[] = [];
  loading = true;

  constructor(
    private apprenantService: ApprenantService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    // 1. Rendu instantané depuis le snapshot localStorage (0ms !)
    const cached = this.apprenantService.getCertificatsSnapshot();
    if (cached) {
      this.certificats = cached;
      this.loading = false;
    }

    // 2. Revalidation silencieuse en tâche de fond
    this.loadCertificats(cached === null);
  }

  loadCertificats(showSpinner = true) {
    if (showSpinner) {
      this.loading = true;
    }
    this.apprenantService.getCertificats().subscribe({
      next: (data) => {
        this.certificats = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Erreur lors du chargement des certificats.');
      },
    });
  }
}
