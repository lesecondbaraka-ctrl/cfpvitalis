import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CertificationService } from '../../../core/services/certification.service';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  template: `
    <div class="min-h-screen bg-[#F5F6F7] font-sans text-[#1B1D1F]">

      <!-- HEADER INSTITUTIONNEL -->
      <header class="bg-[#124F80] text-white shadow-lg border-b-4 border-[#F0791E]">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <a href="/" class="flex items-center gap-3 group">
            <img
              src="assets/logo-vitalis.png"
              alt="Vitalis Center EUP"
              width="140"
              height="40"
              class="h-10 w-auto object-contain bg-white/95 p-1 rounded-xs shadow-xs"
            />
            <div class="hidden sm:block">
              <p class="text-xs font-bold uppercase tracking-wider text-white">Vitalis Center EUP</p>
              <p class="text-[10px] text-[#F0791E] font-semibold uppercase tracking-wider">Registre Officiel des Certifications</p>
            </div>
          </a>
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-[#276B44] animate-pulse"></div>
            <span class="text-xs font-semibold text-[#E7F1FA]">Système en ligne</span>
          </div>
        </div>
      </header>

      <!-- CONTENU PRINCIPAL -->
      <main class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">

        <!-- TITRE -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E7F1FA] border border-[#1C75BC]/30 rounded-xs text-[#1C75BC] text-xs font-bold uppercase tracking-wider">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Verification Publique Officielle</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-[#124F80] font-heading">Verifier l'Authenticite d'un Certificat</h1>
          <div class="barre mx-auto"></div>
          <p class="text-sm text-[#4B5157] max-w-xl mx-auto leading-relaxed">
            Saisissez le numero de serie officiel delivre par Vitalis Center pour verifier son authenticite en temps reel aupres du registre officiel.
          </p>
        </div>

        <!-- FORMULAIRE DE RECHERCHE -->
        <div class="bg-white border border-[#D7DBDE] rounded-xs shadow-xs p-5 sm:p-6">
          <form (ngSubmit)="rechercherAutre()" class="flex flex-col sm:flex-row gap-3">
            <div class="flex-1">
              <label class="block text-xs font-bold text-[#4B5157] uppercase tracking-wider mb-1.5">
                Numero de serie officiel
              </label>
              <input
                type="text"
                [(ngModel)]="searchInput"
                name="searchInput"
                placeholder="Ex : CERT-2026-00001"
                class="w-full px-4 py-2.5 border border-[#D7DBDE] rounded-xs text-sm font-mono text-[#1B1D1F] bg-[#F5F6F7] focus:outline-none focus:ring-2 focus:ring-[#1C75BC] focus:border-[#1C75BC] transition-all"
              />
            </div>
            <button
              type="submit"
              [disabled]="!searchInput || searchInput.trim().length < 3 || verifying"
              class="sm:self-end px-6 py-2.5 bg-[#1C75BC] hover:bg-[#124F80] text-white text-xs font-bold rounded-xs shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>{{ verifying ? 'Verification...' : 'Verifier' }}</span>
            </button>
          </form>
        </div>

        <!-- LOADING -->
        @if (loading) {
          <div class="bg-white border border-[#D7DBDE] rounded-xs shadow-xs p-10 flex flex-col items-center gap-4">
            <div class="w-12 h-12 border-4 border-[#1C75BC] border-t-transparent rounded-full animate-spin"></div>
            <p class="text-sm font-semibold text-[#4B5157]">Interrogation du registre officiel Vitalis Center...</p>
            <p class="text-xs text-[#9AA1A8] font-mono">{{ numeroSerie }}</p>
          </div>
        }

        <!-- CERTIFICAT VALIDE -->
        @if (!loading && result && result.valide) {
          <div class="space-y-4 animate-fade-in">
            <div class="bg-[#E7F1EA] border-2 border-[#276B44] rounded-xs p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div class="w-14 h-14 rounded-xs bg-[#276B44] flex items-center justify-center shrink-0 shadow-md">
                <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="flex-1">
                <div class="flex flex-wrap gap-2 mb-1">
                  <span class="px-2 py-0.5 bg-[#276B44] text-white text-[10px] font-bold uppercase tracking-wider rounded-xs">Certificat Authentique</span>
                  <span class="px-2 py-0.5 bg-[#E7F1EA] text-[#276B44] text-[10px] font-bold uppercase tracking-wider border border-[#276B44] rounded-xs">Valide et Verifie</span>
                </div>
                <h2 class="text-lg font-extrabold text-[#276B44] font-heading">Ce certificat est authentique</h2>
                <p class="text-xs text-[#4B5157] mt-0.5">Enregistre dans le registre officiel Vitalis Center EUP · Verification en temps reel</p>
              </div>
            </div>

            <div class="bg-white border border-[#D7DBDE] rounded-xs shadow-xs overflow-hidden">
              <div class="px-5 sm:px-6 py-3.5 border-b border-[#D7DBDE] bg-[#F5F6F7] flex items-center gap-2">
                <svg class="w-4 h-4 text-[#1C75BC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span class="text-xs font-bold text-[#1B1D1F] uppercase tracking-wider">Fiche Officielle du Certificat</span>
              </div>

              <div class="p-5 sm:p-6 space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p class="text-[10px] font-bold uppercase tracking-wider text-[#9AA1A8]">Numero de Serie</p>
                    <p class="text-sm font-mono font-bold text-[#1C75BC]">{{ result.certificat.numeroSerie }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] font-bold uppercase tracking-wider text-[#9AA1A8]">Date d'Emission</p>
                    <p class="text-sm font-semibold text-[#1B1D1F]">{{ result.certificat.dateEmission | date:'dd/MM/yyyy' }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] font-bold uppercase tracking-wider text-[#9AA1A8]">Titulaire</p>
                    <p class="text-sm font-bold text-[#1B1D1F]">{{ result.certificat.utilisateur?.prenom }} {{ result.certificat.utilisateur?.nom }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] font-bold uppercase tracking-wider text-[#9AA1A8]">Etablissement</p>
                    <p class="text-sm font-semibold text-[#1B1D1F]">{{ result.certificat.formation?.etablissement?.nom || 'Vitalis Center EUP' }}</p>
                  </div>
                  <div class="sm:col-span-2">
                    <p class="text-[10px] font-bold uppercase tracking-wider text-[#9AA1A8]">Formation Certifiee</p>
                    <p class="text-sm font-bold text-[#1C75BC]">{{ result.certificat.formation?.titre }}</p>
                  </div>
                  @if (result.certificat.moyenneGenerale) {
                    <div>
                      <p class="text-[10px] font-bold uppercase tracking-wider text-[#9AA1A8]">Moyenne Generale</p>
                      <p class="text-sm font-bold font-mono" [class]="result.certificat.moyenneGenerale >= 14 ? 'text-[#276B44]' : 'text-[#1C75BC]'">
                        {{ result.certificat.moyenneGenerale }}/20
                      </p>
                    </div>
                  }
                </div>

                @if (result.certificat.hashVerification) {
                  <div class="pt-4 border-t border-[#D7DBDE]">
                    <p class="text-[10px] font-bold uppercase tracking-wider text-[#9AA1A8] mb-1.5 flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5 text-[#276B44]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Signature Cryptographique SHA-256
                    </p>
                    <p class="font-mono text-[10px] sm:text-xs text-[#4B5157] bg-[#F5F6F7] border border-[#D7DBDE] rounded-xs p-2.5 break-all select-all leading-relaxed">
                      {{ result.certificat.hashVerification }}
                    </p>
                  </div>
                }

                <div class="flex items-start gap-2.5 p-3.5 bg-[#E7F1FA] border border-[#1C75BC]/30 rounded-xs">
                  <svg class="w-4 h-4 text-[#1C75BC] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-[11px] text-[#1C75BC] leading-relaxed">
                    Ce certificat a ete <strong>emis et signe electroniquement</strong> par Vitalis Center EUP,
                    etablissement d'utilite publique, sous supervision du Ministere de la Formation Professionnelle.
                    Son authenticite est <strong>garantie par le registre officiel.</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- ERREUR / INTROUVABLE -->
        @if (!loading && error) {
          <div class="animate-fade-in bg-white border-2 border-[#ED1C24] rounded-xs shadow-xs p-6 sm:p-8">
            <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div class="w-14 h-14 rounded-xs bg-[#ED1C24] flex items-center justify-center shrink-0 shadow-md">
                <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="text-center sm:text-left">
                <span class="inline-block px-2 py-0.5 bg-[#ED1C24] text-white text-[10px] font-bold uppercase tracking-wider rounded-xs mb-2">
                  Certificat Non Valide
                </span>
                <h2 class="text-lg font-extrabold text-[#ED1C24] font-heading">Certificat introuvable dans le registre</h2>
                <p class="text-sm text-[#4B5157] mt-1 max-w-md leading-relaxed">{{ error }}</p>
                <div class="mt-4 p-3 bg-[#F5F6F7] border border-[#D7DBDE] rounded-xs text-xs text-[#4B5157] leading-relaxed">
                  <strong class="text-[#1B1D1F]">Causes possibles :</strong>
                  <ul class="list-disc list-inside mt-1 space-y-0.5">
                    <li>Numero de serie saisi incorrect (verifiez la casse et les tirets)</li>
                    <li>Le certificat n'a pas encore ete emis par l'etablissement</li>
                    <li>Le certificat n'appartient pas a Vitalis Center EUP</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        }
      </main>

      <!-- FOOTER -->
      <footer class="mt-12 border-t border-[#D7DBDE] bg-white py-5 px-4 text-center">
        <p class="text-xs text-[#9AA1A8]">
          2026 Vitalis Center EUP · Registre Officiel des Certifications · Tous droits reserves
        </p>
        <p class="text-[10px] text-[#D7DBDE] mt-1 font-mono">
          Verification securisee · Signature SHA-256 · Autorite de Certification Publique
        </p>
      </footer>
    </div>
  `,
})
export class VerifyComponent implements OnInit {
  result: any = null;
  loading = true;
  verifying = false;
  error = '';
  numeroSerie = '';
  searchInput = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private certService: CertificationService,
  ) {}

  ngOnInit() {
    // S'abonne aux changements d'URL en temps réel
    this.route.paramMap.subscribe(params => {
      const num = params.get('numeroSerie');
      if (num) {
        this.numeroSerie = num.trim().toUpperCase();
        this.searchInput = this.numeroSerie;
        this.verifier(this.numeroSerie);
      } else {
        this.loading = false;
      }
    });
  }

  verifier(num: string) {
    const cleanNum = (num || '').trim().toUpperCase();
    if (!cleanNum) return;

    // 1. Rendu instantané si déjà en mémoire (0 milliseconde)
    const cached = this.certService.getVerificationSnapshot(cleanNum);
    if (cached) {
      this.result = cached;
      this.loading = false;
      this.error = '';
    } else {
      this.loading = true;
      this.result = null;
      this.error = '';
    }

    // 2. Interrogation directe de l'API
    this.certService.verifier(cleanNum).subscribe({
      next: (data) => {
        this.result = data;
        this.error = '';
        this.loading = false;
      },
      error: (e) => {
        this.result = null;
        this.error = e.error?.message || `Aucun certificat avec le numéro "${cleanNum}" n'a été trouvé dans le registre officiel.`;
        this.loading = false;
      },
    });
  }

  rechercherAutre() {
    const cleanNum = this.searchInput?.trim().toUpperCase();
    if (!cleanNum || cleanNum.length < 3) return;
    this.verifying = true;
    this.numeroSerie = cleanNum;
    this.router.navigate(['/certificats/verifier', cleanNum]).then(() => {
      this.verifying = false;
    });
  }
}
