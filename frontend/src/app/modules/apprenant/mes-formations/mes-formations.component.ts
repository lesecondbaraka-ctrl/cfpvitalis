import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApprenantService, ApprenantFormation } from '../../../core/services/apprenant.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-mes-formations',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in pb-12 min-w-0">

      <!-- ══════════ EN-TÊTE OFFICIEL VITALIS CENTER ══════════ -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-[#1B1D1F] font-heading">Mes Formations Inscrites</h1>
          <div class="barre"></div>
          <p class="text-xs text-[#4B5157] mt-2 leading-relaxed max-w-2xl">
            Consultez les parcours de qualification professionnelle qui vous sont affectés, suivez votre progression pédagogique et préparez vos certifications officielles.
          </p>
        </div>

        <div class="flex items-center gap-2.5 shrink-0">
          @if (!loading && formations.length > 0) {
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-[#E7F1FA] border border-[#1C75BC]/30 text-[#1C75BC] text-[11px] font-bold">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              {{ formations.length }} Parcours inscrit{{ formations.length > 1 ? 's' : '' }}
            </span>
          }

          <!-- BOUTON ACTUALISER -->
          <button
            type="button"
            (click)="loadFormations(true, true)"
            [disabled]="loading"
            class="px-3 py-1.5 rounded-xs bg-white hover:bg-[#F5F6F7] text-[#1B1D1F] border border-[#D7DBDE] text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            title="Rafraîchir la liste des formations"
          >
            <svg
              class="w-3.5 h-3.5 text-[#1C75BC]"
              [class.animate-spin]="loading"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span class="hidden sm:inline">{{ loading ? 'Chargement...' : 'Actualiser' }}</span>
          </button>
        </div>
      </div>

      <!-- ══════════ BARRE DE KPIS SYNTHÉTIQUES ══════════ -->
      @if (!loading && formations.length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- KPI 1 : Formations Inscrites (Bleu Cobalt) -->
          <div class="flex items-center gap-4 p-4 bg-white border border-[#D7DBDE] rounded-xs shadow-xs hover:border-[#1C75BC]/40 hover:shadow-md transition-all">
            <div class="w-10 h-10 rounded-xs bg-[#E7F1FA] flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-[#1C75BC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p class="text-[10px] text-[#4B5157] uppercase font-bold tracking-wider">Inscriptions Actives</p>
              <p class="text-2xl font-black text-[#1C75BC] font-mono leading-none mt-0.5">{{ formations.length }}</p>
              <p class="text-[10px] text-[#4B5157] mt-0.5">formation{{ formations.length > 1 ? 's' : '' }} en cours d'étude</p>
            </div>
          </div>

          <!-- KPI 2 : Certifications Validées (Vert Forêt) -->
          <div class="flex items-center gap-4 p-4 bg-white border border-[#D7DBDE] rounded-xs shadow-xs hover:border-[#276B44]/40 hover:shadow-md transition-all">
            <div class="w-10 h-10 rounded-xs bg-[#E7F1EA] flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-[#276B44]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
              </svg>
            </div>
            <div>
              <p class="text-[10px] text-[#4B5157] uppercase font-bold tracking-wider">Titres Validés</p>
              <p class="text-2xl font-black text-[#276B44] font-mono leading-none mt-0.5">{{ nbCertifiees }}</p>
              <p class="text-[10px] text-[#4B5157] mt-0.5">certificat{{ nbCertifiees > 1 ? 's' : '' }} ministériel{{ nbCertifiees > 1 ? 's' : '' }} émis</p>
            </div>
          </div>

          <!-- KPI 3 : Progression Moyenne (Ambre Safran) -->
          <div class="flex items-center gap-4 p-4 bg-white border border-[#D7DBDE] rounded-xs shadow-xs hover:border-[#F0791E]/40 hover:shadow-md transition-all">
            <div class="w-10 h-10 rounded-xs bg-[#FDECDD] flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-[#F0791E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p class="text-[10px] text-[#4B5157] uppercase font-bold tracking-wider">Complétion Moyenne</p>
              <p class="text-2xl font-black text-[#F0791E] font-mono leading-none mt-0.5">{{ progressionMoyenne }}%</p>
              <p class="text-[10px] text-[#4B5157] mt-0.5">avancement global du cursus</p>
            </div>
          </div>
        </div>
      }

      <!-- ══════════ BARRE DE RECHERCHE ET FILTRES ══════════ -->
      @if (!loading && formations.length > 0) {
        <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-white border border-[#D7DBDE] rounded-xs shadow-xs">
          <!-- Champ de recherche -->
          <div class="relative flex-1">
            <svg class="w-4 h-4 text-[#4B5157] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              placeholder="Rechercher par titre de formation, antenne..."
              class="w-full pl-9 pr-8 py-2 bg-[#F5F6F7] border border-[#D7DBDE] rounded-xs text-xs text-[#1B1D1F] placeholder-[#4B5157] focus:outline-none focus:border-[#1C75BC] focus:bg-white transition-all font-sans"
            />
            @if (searchTerm) {
              <button
                type="button"
                (click)="searchTerm = ''"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4B5157] hover:text-[#1B1D1F] text-xs font-bold cursor-pointer"
                title="Effacer la recherche"
              >
                ✕
              </button>
            }
          </div>

          <!-- Onglets de filtrage par statut -->
          <div class="flex items-center gap-1.5 shrink-0 overflow-x-auto">
            <button
              type="button"
              (click)="selectedFilter = 'all'"
              class="px-3 py-1.5 rounded-xs text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
              [class]="selectedFilter === 'all' ? 'bg-[#1C75BC] text-white shadow-2xs' : 'bg-[#F5F6F7] text-[#4B5157] hover:bg-[#D7DBDE] hover:text-[#1B1D1F] border border-[#D7DBDE]'"
            >
              Toutes ({{ formations.length }})
            </button>
            <button
              type="button"
              (click)="selectedFilter = 'en_cours'"
              class="px-3 py-1.5 rounded-xs text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
              [class]="selectedFilter === 'en_cours' ? 'bg-[#1C75BC] text-white shadow-2xs' : 'bg-[#F5F6F7] text-[#4B5157] hover:bg-[#D7DBDE] hover:text-[#1B1D1F] border border-[#D7DBDE]'"
            >
              En cours ({{ nbEnCours }})
            </button>
            <button
              type="button"
              (click)="selectedFilter = 'certifiee'"
              class="px-3 py-1.5 rounded-xs text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
              [class]="selectedFilter === 'certifiee' ? 'bg-[#276B44] text-white shadow-2xs' : 'bg-[#F5F6F7] text-[#4B5157] hover:bg-[#D7DBDE] hover:text-[#1B1D1F] border border-[#D7DBDE]'"
            >
              Certifiées ({{ nbCertifiees }})
            </button>
          </div>
        </div>
      }

      <!-- ══════════ ÉTAT DE CHARGEMENT ══════════ -->
      @if (loading) {
        <div class="p-16 text-center text-[#4B5157] bg-white border border-[#D7DBDE] rounded-xs shadow-xs">
          <div class="inline-block w-8 h-8 border-3 border-[#1C75BC] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p class="text-xs font-semibold text-[#4B5157]">Vérification de vos parcours et modules...</p>
        </div>

      <!-- ══════════ ÉTAT AUCUNE FORMATION INSCRITE ══════════ -->
      } @else if (formations.length === 0) {
        <div class="p-12 text-center bg-white border border-[#D7DBDE] text-[#4B5157] rounded-xs space-y-4 shadow-xs">
          <div class="w-16 h-16 rounded-xs bg-[#E7F1FA] text-[#1C75BC] flex items-center justify-center mx-auto border border-[#1C75BC]/30">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <div class="space-y-1">
            <h3 class="text-base font-bold text-[#1B1D1F]">Aucune formation affectée pour le moment</h3>
            <p class="text-xs text-[#4B5157] max-w-md mx-auto leading-relaxed">
              Vous n'êtes actuellement inscrit à aucun parcours actif. Dès validation de votre admission ou affectation par votre établissement, vos formations apparaîtront ici.
            </p>
          </div>
          <div class="pt-2">
            <a
              routerLink="/apprenant/dashboard"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xs bg-[#1C75BC] hover:bg-[#124F80] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <span>Retourner au Tableau de Bord</span>
            </a>
          </div>
        </div>

      <!-- ══════════ ÉTAT AUCUN RÉSULTAT POUR LA RECHERCHE ══════════ -->
      } @else if (formationsFiltrees.length === 0) {
        <div class="p-10 text-center bg-white border border-[#D7DBDE] text-[#4B5157] rounded-xs space-y-3 shadow-xs">
          <p class="text-sm font-semibold text-[#1B1D1F]">Aucune formation ne correspond à vos critères de recherche.</p>
          <button
            type="button"
            (click)="searchTerm = ''; selectedFilter = 'all'"
            class="px-4 py-2 rounded-xs bg-[#1C75BC] text-white text-xs font-bold cursor-pointer hover:bg-[#124F80] transition-all"
          >
            Réinitialiser les filtres
          </button>
        </div>

      <!-- ══════════ GRILLE DES FORMATIONS MODERNISÉE ══════════ -->
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (f of formationsFiltrees; track f.id) {
            <div
              class="bg-white border border-[#D7DBDE] hover:border-[#1C75BC] hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden rounded-xs shadow-xs group"
              [style.border-top-width]="'4px'"
              [style.border-top-color]="f.estCertifie ? '#276B44' : '#1C75BC'"
            >
              <!-- Corps de la carte -->
              <div class="p-5 space-y-4">
                <!-- En-tête : Antenne & Statut -->
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <!-- Antenne -->
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-[#F5F6F7] border border-[#D7DBDE] text-[10px] font-semibold text-[#4B5157]">
                    <svg class="w-3 h-3 text-[#1C75BC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span class="truncate max-w-[140px]">{{ f.etablissement?.nom || 'Vitalis Center EUP' }}</span>
                  </span>

                  <!-- Statut -->
                  <span
                    class="px-2.5 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border"
                    [class]="f.estCertifie ? 'bg-[#E7F1EA] text-[#276B44] border-[#276B44]' : 'bg-[#E7F1FA] text-[#1C75BC] border-[#1C75BC]'"
                  >
                    @if (f.estCertifie) {
                      <svg class="w-3 h-3 text-[#276B44]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Certifié</span>
                    } @else {
                      <span>En cours</span>
                    }
                  </span>
                </div>

                <!-- Titre & Description -->
                <div>
                  <h2 class="text-base font-bold text-[#1B1D1F] leading-snug group-hover:text-[#1C75BC] transition-colors line-clamp-2">
                    {{ f.titre }}
                  </h2>
                  <p class="text-xs text-[#4B5157] mt-1.5 line-clamp-2 leading-relaxed">
                    {{ f.description || 'Programme qualifiant accrédité par le Ministère de la Formation Professionnelle.' }}
                  </p>
                </div>

                <!-- Jauge de progression -->
                <div class="space-y-1.5 p-3 bg-[#F5F6F7] border border-[#D7DBDE] rounded-xs">
                  <div class="flex justify-between items-center text-[11px]">
                    <span class="text-[#4B5157] font-semibold">Complétion modulaire</span>
                    <span class="font-mono font-bold" [class]="f.estCertifie || f.pourcentage === 100 ? 'text-[#276B44]' : 'text-[#1C75BC]'">
                      {{ f.pourcentage }}%
                    </span>
                  </div>
                  <div class="w-full bg-[#D7DBDE] h-2 rounded-full overflow-hidden">
                    <div
                      class="h-2 rounded-full transition-all duration-700"
                      [class]="f.estCertifie || f.pourcentage === 100 ? 'bg-[#276B44]' : 'bg-[#1C75BC]'"
                      [style.width.%]="f.pourcentage"
                    ></div>
                  </div>
                  <div class="flex justify-between text-[10px] text-[#4B5157]">
                    <span>Cours : {{ f.coursCompletes }} / {{ f.totalCours }} terminés</span>
                    @if (f.certificat) {
                      <span class="text-[#276B44] font-bold font-mono">N° {{ f.certificat.numeroSerie }}</span>
                    }
                  </div>
                </div>

                <!-- Attributs pédagogiques -->
                <div class="grid grid-cols-3 gap-2 text-center text-xs text-[#4B5157] pt-2 border-t border-[#D7DBDE]">
                  <div class="p-1.5 bg-white border border-[#D7DBDE] rounded-xs">
                    <p class="text-[9px] uppercase font-bold text-[#4B5157]">Modules</p>
                    <p class="text-sm font-bold text-[#1B1D1F] font-mono">{{ f.nbModules }}</p>
                  </div>
                  <div class="p-1.5 bg-white border border-[#D7DBDE] rounded-xs">
                    <p class="text-[9px] uppercase font-bold text-[#4B5157]">Cours</p>
                    <p class="text-sm font-bold text-[#1B1D1F] font-mono">{{ f.totalCours }}</p>
                  </div>
                  <div class="p-1.5 bg-white border border-[#D7DBDE] rounded-xs">
                    <p class="text-[9px] uppercase font-bold text-[#4B5157]">Éval / Quiz</p>
                    <p class="text-sm font-bold text-[#F0791E] font-mono">{{ (f.totalQuiz || 0) + (f.totalDevoirs || 0) }}</p>
                  </div>
                </div>
              </div>

              <!-- Pied de Carte : Double Action Réactive -->
              <div class="p-4 bg-[#F5F6F7] border-t border-[#D7DBDE] flex items-center gap-2">
                @if (f.estCertifie) {
                  <a
                    routerLink="/apprenant/certificats"
                    class="flex-1 px-3 py-2 rounded-xs bg-[#E7F1EA] hover:bg-[#276B44] text-[#276B44] hover:text-white border border-[#276B44] text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Consulter le certificat officiel"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138-3.138z" />
                    </svg>
                    <span>Certificat</span>
                  </a>
                  <a
                    [routerLink]="['/apprenant/formations', f.id]"
                    class="flex-1 px-3 py-2 rounded-xs bg-[#1C75BC] hover:bg-[#124F80] text-white text-xs font-bold text-center transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                  >
                    <span>Accéder</span>
                    <span>→</span>
                  </a>
                } @else {
                  <a
                    [routerLink]="['/apprenant/formations', f.id]"
                    class="w-full px-4 py-2 rounded-xs bg-[#1C75BC] hover:bg-[#124F80] text-white text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Continuer la formation</span>
                    <span>→</span>
                  </a>
                }
              </div>
            </div>
          }
        </div>
      }

    </div>
  `,
})
export class MesFormationsComponent implements OnInit, OnDestroy {
  formations: ApprenantFormation[] = [];
  loading = true;
  searchTerm = '';
  selectedFilter: 'all' | 'en_cours' | 'certifiee' = 'all';

  private liveSub?: Subscription;

  constructor(
    private apprenantService: ApprenantService,
    private toast: ToastService,
  ) {}

  get formationsFiltrees(): ApprenantFormation[] {
    let list = this.formations;

    // Filtre par statut
    if (this.selectedFilter === 'en_cours') {
      list = list.filter((f) => !f.estCertifie);
    } else if (this.selectedFilter === 'certifiee') {
      list = list.filter((f) => f.estCertifie);
    }

    // Filtre par terme de recherche
    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      list = list.filter(
        (f) =>
          f.titre.toLowerCase().includes(term) ||
          (f.description && f.description.toLowerCase().includes(term)) ||
          (f.etablissement?.nom && f.etablissement.nom.toLowerCase().includes(term)) ||
          (f.certificat?.numeroSerie && f.certificat.numeroSerie.toLowerCase().includes(term))
      );
    }

    return list;
  }

  get nbCertifiees(): number {
    return this.formations.filter((f) => f.estCertifie).length;
  }

  get nbEnCours(): number {
    return this.formations.filter((f) => !f.estCertifie).length;
  }

  get progressionMoyenne(): number {
    if (!this.formations.length) return 0;
    const total = this.formations.reduce((acc, f) => acc + f.pourcentage, 0);
    return Math.round(total / this.formations.length);
  }

  ngOnInit() {
    // 1. Rendu instantané depuis le snapshot cache local (0ms !)
    const cached = this.apprenantService.getFormationsSnapshot();
    if (cached && cached.length > 0) {
      this.formations = cached;
      this.loading = false;
    }

    // 2. Revalidation en arrière-plan
    this.loadFormations(cached === null || cached.length === 0, false);

    // 3. Rafraîchissement SSE — nouveau cours ou certificat émis
    this.liveSub = this.apprenantService.liveUpdates$.subscribe((event) => {
      if (event.type === 'COURS_PUBLIE' || event.type === 'CERTIFICAT_EMIS' || event.type === 'NOTE_PUBLIEE') {
        this.loadFormations(false, false);
      }
    });
  }

  ngOnDestroy() {
    this.liveSub?.unsubscribe();
  }

  loadFormations(showSpinner = true, isManual = false) {
    if (showSpinner) {
      this.loading = true;
    }
    this.apprenantService.getFormations().subscribe({
      next: (data) => {
        this.formations = data;
        this.loading = false;
        if (isManual) {
          this.toast.success('Liste des formations actualisée avec succès.');
        }
      },
      error: () => {
        this.loading = false;
        this.toast.error('Erreur lors du chargement des formations.');
      },
    });
  }
}
