import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-mon-profil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <!-- HEADER -->
      <div>
        <h1 class="text-2xl font-bold text-[#1B1D1F] font-heading">Mon Profil Apprenant</h1>
        <div class="barre"></div>
        <p class="text-xs text-[#4B5157] mt-2">
          Informations de compte, établissement de rattachement et sécurité des accès.
        </p>
      </div>

      <!-- TABS (Scrollable horizontally on mobile) -->
      <div class="flex items-center gap-1 sm:gap-2 border-b border-[#D7DBDE] overflow-x-auto whitespace-nowrap pb-0.5">
        <button
          (click)="activeTab = 'info'"
          class="px-3 sm:px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 shrink-0"
          [class]="activeTab === 'info' ? 'border-[#1C75BC] text-[#1C75BC]' : 'border-transparent text-[#4B5157] hover:text-[#1B1D1F]'"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Vue d'ensemble</span>
        </button>
        <button
          (click)="activeTab = 'edit'"
          class="px-3 sm:px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 shrink-0"
          [class]="activeTab === 'edit' ? 'border-[#1C75BC] text-[#1C75BC]' : 'border-transparent text-[#4B5157] hover:text-[#1B1D1F]'"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Modifier l'identité</span>
        </button>
        <button
          (click)="activeTab = 'password'"
          class="px-3 sm:px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 shrink-0"
          [class]="activeTab === 'password' ? 'border-[#1C75BC] text-[#1C75BC]' : 'border-transparent text-[#4B5157] hover:text-[#1B1D1F]'"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Sécurité & Mot de passe</span>
        </button>
      </div>

      @if (user) {
        <!-- TAB 1: OVERVIEW -->
        @if (activeTab === 'info') {
          <div class="p-6 md:p-8 bg-white border border-[#D7DBDE] rounded-xs space-y-8 animate-fade-in shadow-xs">
            <!-- Profile Card Header -->
            <div class="flex flex-col sm:flex-row sm:items-center gap-6">
              <div class="w-16 h-16 rounded-xs bg-[#124F80] text-white font-black text-2xl flex items-center justify-center shadow-xs border-b-2 border-[#F0791E] font-heading">
                {{ user.prenom?.charAt(0) }}{{ user.nom?.charAt(0) }}
              </div>

              <div class="space-y-1 flex-1">
                <div class="flex items-center gap-3 flex-wrap">
                  <h2 class="text-xl font-bold text-[#1B1D1F]">{{ user.prenom }} {{ user.nom }}</h2>
                  <span class="px-2.5 py-0.5 rounded-xs bg-[#E7F1EA] text-[#276B44] border border-[#276B44] text-xs font-bold uppercase tracking-wider">
                    Apprenant Actif
                  </span>
                </div>
                <p class="text-xs text-[#4B5157] font-mono">{{ user.email }}</p>
                <p class="text-[11px] text-[#1C75BC] font-mono font-semibold">ID : {{ user.id }}</p>
              </div>
            </div>

            <!-- Info Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-[#D7DBDE]">
              <div class="p-4 bg-[#F5F6F7] border border-[#D7DBDE] rounded-xs space-y-1">
                <span class="text-[10px] uppercase font-bold text-[#4B5157]">Rôle sur la plateforme</span>
                <p class="text-xs font-bold text-[#1B1D1F]">APPRENANT / ÉTUDIANT</p>
                <p class="text-[11px] text-[#4B5157]">Accès aux cours 24/7, passage des quiz et certificats.</p>
              </div>

              <div class="p-4 bg-[#F5F6F7] border border-[#D7DBDE] rounded-xs space-y-1">
                <span class="text-[10px] uppercase font-bold text-[#4B5157]">Établissement / Antenne</span>
                <p class="text-xs font-bold text-[#1B1D1F]">{{ user.etablissement?.nom || 'Centre Principal Kinshasa' }}</p>
                <p class="text-[11px] text-[#4B5157] font-mono">Code : {{ user.etablissement?.codeAntenne || 'CP-KIN' }}</p>
              </div>
            </div>

            <!-- Academic Charter & Integrity Statement -->
            <div class="p-5 bg-[#E7F1FA] border-l-4 border-[#1C75BC] border border-[#D7DBDE] space-y-2 rounded-xs shadow-2xs">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-[#1C75BC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 class="text-xs font-bold text-[#1C75BC] uppercase tracking-wider">Charte Pédagogique & Validations</h3>
              </div>
              <p class="text-xs text-[#1B1D1F] leading-relaxed">
                Vos évaluations et scores sont calculés et scellés directement sur les serveurs de Vitalis Center. L'obtention de chaque titre requiert le respect strict des critères d'assiduité et de notation (Règle BR-03).
              </p>
            </div>
          </div>
        }

        <!-- TAB 2: EDIT PROFILE -->
        @if (activeTab === 'edit') {
          <div class="p-6 md:p-8 bg-white border border-[#D7DBDE] rounded-xs space-y-6 animate-fade-in">
            <div>
              <h2 class="text-base font-bold text-[#1B1D1F]">Modifier vos informations d'identité</h2>
              <p class="text-xs text-[#4B5157] mt-0.5">Ces informations apparaîtront sur vos attestations et certificats officiels.</p>
            </div>

            <form (ngSubmit)="saveProfile()" class="space-y-4 max-w-lg">
              <div>
                <label class="block text-xs font-semibold text-[#1B1D1F] mb-1">Prénom</label>
                <input
                  type="text"
                  [(ngModel)]="editForm.prenom"
                  name="prenom"
                  required
                  class="w-full px-3 py-2 border border-[#D7DBDE] rounded-xs text-xs focus:border-[#1C75BC] focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-[#1B1D1F] mb-1">Nom</label>
                <input
                  type="text"
                  [(ngModel)]="editForm.nom"
                  name="nom"
                  required
                  class="w-full px-3 py-2 border border-[#D7DBDE] rounded-xs text-xs focus:border-[#1C75BC] focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-[#4B5157] mb-1">Adresse Email (non modifiable)</label>
                <input
                  type="email"
                  [value]="user.email"
                  disabled
                  class="w-full px-3 py-2 border border-[#D7DBDE] bg-[#F5F6F7] text-[#4B5157] rounded-xs text-xs cursor-not-allowed"
                />
              </div>

              <div class="pt-2">
                <button
                  type="submit"
                  [disabled]="savingProfile"
                  class="px-5 py-2.5 rounded-xs bg-[#1C75BC] hover:bg-[#124F80] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2"
                >
                  <span>{{ savingProfile ? 'Enregistrement...' : 'Enregistrer les modifications' }}</span>
                </button>
              </div>
            </form>
          </div>
        }

        <!-- TAB 3: CHANGE PASSWORD -->
        @if (activeTab === 'password') {
          <div class="p-6 md:p-8 bg-white border border-[#D7DBDE] rounded-xs space-y-6 animate-fade-in">
            <div>
              <h2 class="text-base font-bold text-[#1B1D1F]">Changer mon mot de passe</h2>
              <p class="text-xs text-[#4B5157] mt-0.5">Le mot de passe doit respecter le standard ANSSI (minimum 12 caractères, majuscule, minuscule, chiffre et symbole).</p>
            </div>

            <form (ngSubmit)="savePassword()" class="space-y-4 max-w-lg">
              <div>
                <label class="block text-xs font-semibold text-[#1B1D1F] mb-1">Mot de passe actuel</label>
                <input
                  type="password"
                  [(ngModel)]="passwordForm.ancien"
                  name="ancien"
                  required
                  class="w-full px-3 py-2 border border-[#D7DBDE] rounded-xs text-xs focus:border-[#1C75BC] focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-[#1B1D1F] mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  [(ngModel)]="passwordForm.nouveau"
                  name="nouveau"
                  required
                  class="w-full px-3 py-2 border border-[#D7DBDE] rounded-xs text-xs focus:border-[#1C75BC] focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-[#1B1D1F] mb-1">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  [(ngModel)]="passwordForm.confirme"
                  name="confirme"
                  required
                  class="w-full px-3 py-2 border border-[#D7DBDE] rounded-xs text-xs focus:border-[#1C75BC] focus:outline-none"
                />
              </div>

              <div class="pt-2">
                <button
                  type="submit"
                  [disabled]="savingPassword"
                  class="px-5 py-2.5 rounded-xs bg-[#F0791E] hover:bg-[#d96612] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>{{ savingPassword ? 'Mise à jour sécurisée...' : 'Modifier le mot de passe' }}</span>
                </button>
              </div>
            </form>
          </div>
        }
      }
    </div>
  `,
})
export class MonProfilComponent implements OnInit {
  user: any = null;
  activeTab: 'info' | 'edit' | 'password' = 'info';

  editForm = {
    nom: '',
    prenom: '',
  };

  passwordForm = {
    ancien: '',
    nouveau: '',
    confirme: '',
  };

  savingProfile = false;
  savingPassword = false;

  constructor(
    private auth: AuthService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.user = this.auth.currentUser;
    if (this.user) {
      this.editForm.nom = this.user.nom || '';
      this.editForm.prenom = this.user.prenom || '';
    }
  }

  saveProfile() {
    if (!this.editForm.nom.trim() || !this.editForm.prenom.trim()) {
      this.toast.error('Veuillez renseigner votre nom et votre prénom.');
      return;
    }

    this.savingProfile = true;
    this.auth.updateProfile({ nom: this.editForm.nom, prenom: this.editForm.prenom }).subscribe({
      next: (res) => {
        this.savingProfile = false;
        this.user = res.utilisateur;
        this.toast.success('Profil mis à jour avec succès !');
        this.activeTab = 'info';
      },
      error: (err) => {
        this.savingProfile = false;
        this.toast.error(err.error?.message || 'Erreur lors de la mise à jour du profil.');
      },
    });
  }

  savePassword() {
    if (!this.passwordForm.ancien || !this.passwordForm.nouveau) {
      this.toast.error('Veuillez remplir tous les champs de mot de passe.');
      return;
    }

    if (this.passwordForm.nouveau !== this.passwordForm.confirme) {
      this.toast.error('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }

    if (this.passwordForm.nouveau.length < 12) {
      this.toast.error('Le mot de passe doit comporter au moins 12 caractères.');
      return;
    }

    this.savingPassword = true;
    this.auth.changePassword({
      ancienMotDePasse: this.passwordForm.ancien,
      nouveauMotDePasse: this.passwordForm.nouveau,
    }).subscribe({
      next: () => {
        this.savingPassword = false;
        this.toast.success('Mot de passe mis à jour avec succès !');
        this.passwordForm = { ancien: '', nouveau: '', confirme: '' };
        this.activeTab = 'info';
      },
      error: (err) => {
        this.savingPassword = false;
        this.toast.error(err.error?.message || 'Erreur lors du changement de mot de passe.');
      },
    });
  }
}

