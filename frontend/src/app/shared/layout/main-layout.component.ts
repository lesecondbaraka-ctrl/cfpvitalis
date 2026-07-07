import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="flex min-h-screen bg-vc-bg">
      @if (showNav) {
        <aside class="w-64 text-white flex flex-col" style="background-color: var(--color-vc-primary);">
          <div class="p-6 border-b border-white/20">
            <h2 class="text-lg font-bold text-white font-heading">Vitalis Center EUP</h2>
            @if (auth.currentUser) {
              <p class="text-xs text-white/80 mt-1">{{ auth.currentUser.prenom }} {{ auth.currentUser.nom }}</p>
              <span class="badge badge-personnel-admin mt-2 text-[10px]">{{ auth.currentUser.role }}</span>
            }
          </div>
          <nav class="flex-1 p-4 space-y-1">
            <a routerLink="/dashboard" routerLinkActive="bg-white/20" class="block px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10">Tableau de bord</a>

            @if (auth.hasRole('ADMIN_CENTRE')) {
              <a routerLink="/admin/etablissements" routerLinkActive="bg-white/20" class="block px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10">Établissements</a>
              <a routerLink="/admin/utilisateurs" routerLinkActive="bg-white/20" class="block px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10">Utilisateurs</a>
              <a routerLink="/admin/analytics" routerLinkActive="bg-white/20" class="block px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10">Analytics global</a>
            }

            @if (auth.hasAnyRole(['ADMIN_ETABLISSEMENT', 'PERSONNEL_ADMINISTRATIF'])) {
              <a routerLink="/admin-etab/dashboard" routerLinkActive="bg-white/20" class="block px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10">Mon établissement</a>
              <a routerLink="/admin-etab/utilisateurs" routerLinkActive="bg-white/20" class="block px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10">Utilisateurs établ.</a>
            }

            @if (auth.hasAnyRole(['ADMIN_CENTRE', 'ADMIN_ETABLISSEMENT', 'FORMATEUR'])) {
              <a routerLink="/formations" routerLinkActive="bg-white/20" class="block px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10">Formations</a>
              <a routerLink="/notes" routerLinkActive="bg-white/20" class="block px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10">Notes</a>
              <a routerLink="/seances" routerLinkActive="bg-white/20" class="block px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10">Séances</a>
              <a routerLink="/devoirs/noter" routerLinkActive="bg-white/20" class="block px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10">Corriger devoirs</a>
            }

            @if (auth.hasRole('APPRENANT')) {
              <a routerLink="/mes-cours" routerLinkActive="bg-white/20" class="block px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10">Mes cours</a>
              <a routerLink="/mes-quiz" routerLinkActive="bg-white/20" class="block px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10">Mes quiz</a>
              <a routerLink="/mes-devoirs" routerLinkActive="bg-white/20" class="block px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10">Mes devoirs</a>
              <a routerLink="/mes-certificats" routerLinkActive="bg-white/20" class="block px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10">Mes certificats</a>
            }

            @if (auth.hasAnyRole(['PERSONNEL_ADMINISTRATIF', 'ADMIN_ETABLISSEMENT'])) {
              <a routerLink="/personnel/assiduite" routerLinkActive="bg-white/20" class="block px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10">Assiduité</a>
            }
          </nav>
          <div class="p-4 border-t border-white/20">
            <button class="btn btn-outline w-full text-white border-white hover:bg-white hover:text-vc-primary" (click)="auth.logout()">Déconnexion</button>
          </div>
        </aside>
      }
      <main class="flex-1 overflow-auto">
        <ng-content />
      </main>
    </div>
  `,
})
export class MainLayoutComponent {
  @Input() showNav = true;
  constructor(public auth: AuthService) {}
}
