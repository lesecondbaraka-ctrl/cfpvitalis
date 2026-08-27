import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApprenantService, ApprenantFormation } from '../../../core/services/apprenant.service';

@Component({
  selector: 'app-mes-formations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- HEADER -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-[#1B1D1F] font-heading">Mes Formations Inscrites</h1>
          <div class="barre"></div>
          <p class="text-xs text-[#4B5157] mt-2">
            Consultez les parcours de formation qui vous sont affectés, suivez votre progression et préparez vos certifications officielles.
          </p>
        </div>
      </div>

      <!-- LIST / CARDS -->
      @if (loading) {
        <div class="p-12 text-center text-[#4B5157] bg-white border border-[#D7DBDE] rounded-xs">
          <div class="inline-block w-8 h-8 border-3 border-[#1C75BC] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p class="text-xs font-semibold text-[#4B5157]">Chargement de vos formations...</p>
        </div>
      } @else if (formations.length === 0) {
        <div class="p-12 text-center bg-white border border-[#D7DBDE] text-[#4B5157] rounded-xs space-y-3">
          <svg class="w-12 h-12 text-[#9AA1A8] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
          <h3 class="text-sm font-bold text-[#1B1D1F]">Aucune formation trouvée</h3>
          <p class="text-xs text-[#4B5157]">Vous n'êtes actuellement inscrit à aucune formation active dans votre établissement.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (f of formations; track f.id) {
            <div class="bg-white border border-[#D7DBDE] hover:border-[#1C75BC] transition-all flex flex-col justify-between overflow-hidden rounded-xs shadow-xs group">
              <!-- Top accent bar (charte graphique) -->
              <div class="h-1.5 w-full" [class]="f.estCertifie ? 'bg-[#276B44]' : 'bg-[#1C75BC]'"></div>

              <div class="p-6 space-y-4">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" [class]="f.estCertifie ? 'bg-[#E7F1EA] text-[#276B44] border border-[#276B44]' : 'bg-[#E7F1FA] text-[#1C75BC] border border-[#1C75BC]'">
                    @if (f.estCertifie) {
                      <svg class="w-3 h-3 text-[#276B44]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Certifié</span>
                    } @else {
                      <span>En cours</span>
                    }
                  </span>
                  <span class="text-xs font-bold font-mono" [class]="f.pourcentage === 100 ? 'text-[#276B44]' : 'text-[#1C75BC]'">
                    {{ f.pourcentage }}%
                  </span>
                </div>

                <div>
                  <h2 class="text-base font-bold text-[#1B1D1F] leading-snug group-hover:text-[#1C75BC] transition-colors">{{ f.titre }}</h2>
                  <p class="text-xs text-[#4B5157] mt-1.5 line-clamp-2 leading-relaxed">
                    {{ f.description || 'Parcours de formation technique et professionnelle certifiant.' }}
                  </p>
                </div>

                <!-- Progress bar -->
                <div class="space-y-1.5">
                  <div class="flex justify-between text-[11px] text-[#4B5157]">
                    <span>Progression des cours</span>
                    <span class="font-mono font-medium">{{ f.coursCompletes }} / {{ f.totalCours }} cours</span>
                  </div>
                  <div class="w-full bg-[#E7F1FA] h-2 overflow-hidden">
                    <div
                      class="h-2 transition-all duration-500"
                      [class]="f.pourcentage === 100 ? 'bg-[#276B44]' : 'bg-[#1C75BC]'"
                      [style.width.%]="f.pourcentage"
                    ></div>
                  </div>
                </div>

                <div class="flex items-center gap-4 text-xs text-[#4B5157] pt-2 border-t border-[#D7DBDE]">
                  <span class="flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-[#1C75BC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span><strong>{{ f.nbModules }}</strong> modules</span>
                  </span>
                  <span class="flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-[#276B44]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span><strong>{{ f.totalCours }}</strong> cours</span>
                  </span>
                </div>
              </div>

              <!-- Card Footer -->
              <div class="p-4 bg-[#F5F6F7] border-t border-[#D7DBDE] flex items-center justify-between">
                @if (f.certificat) {
                  <span class="text-[11px] text-[#276B44] font-bold truncate font-mono">
                    N° {{ f.certificat.numeroSerie }}
                  </span>
                } @else {
                  <span class="text-[11px] text-[#4B5157]">
                    Certificat non émis
                  </span>
                }

                <a
                  [routerLink]="['/apprenant/formations', f.id]"
                  class="px-3.5 py-1.5 rounded-xs bg-[#1C75BC] hover:bg-[#124F80] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1"
                >
                  <span>Accéder</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class MesFormationsComponent implements OnInit {
  formations: ApprenantFormation[] = [];
  loading = true;

  constructor(private apprenantService: ApprenantService) {}

  ngOnInit() {
    // 1. Rendu instantané depuis le snapshot cache local (0ms !)
    const cached = this.apprenantService.getFormationsSnapshot();
    if (cached && cached.length > 0) {
      this.formations = cached;
      this.loading = false;
    }
    // 2. Revalidation en arrière-plan
    this.loadFormations(cached === null || cached.length === 0);
  }

  loadFormations(showSpinner = true) {
    if (showSpinner) {
      this.loading = true;
    }
    this.apprenantService.getFormations().subscribe({
      next: (data) => {
        this.formations = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
