import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { MainLayoutComponent } from '../../shared/layout/main-layout.component';
import { KpiGlobal, KpiEtablissement } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MainLayoutComponent],
  template: `
    <app-main-layout>
      <div class="p-8">
        <div class="max-w-6xl mx-auto">
          <h1 class="text-3xl font-bold text-vc-primary font-heading mb-2">Tableau de bord</h1>
          @if (user) {
            <p class="text-vc-secondary text-sm mb-8">
              Bienvenue, <strong>{{ user.prenom }} {{ user.nom }}</strong>
              <span class="badge ml-2" [class]="badgeClass">{{ user.role }}</span>
            </p>
          }

          @if (kpiGlobal) {
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div class="card text-center"><p class="text-2xl font-bold text-vc-primary">{{ kpiGlobal.etablissements }}</p><p class="text-xs text-slate-500">Établissements</p></div>
              <div class="card text-center"><p class="text-2xl font-bold text-vc-primary">{{ kpiGlobal.apprenants }}</p><p class="text-xs text-slate-500">Apprenants</p></div>
              <div class="card text-center"><p class="text-2xl font-bold text-vc-primary">{{ kpiGlobal.formateurs }}</p><p class="text-xs text-slate-500">Formateurs</p></div>
              <div class="card text-center"><p class="text-2xl font-bold text-vc-primary">{{ kpiGlobal.formations }}</p><p class="text-xs text-slate-500">Formations</p></div>
              <div class="card text-center"><p class="text-2xl font-bold text-vc-primary">{{ kpiGlobal.certificatsEmis }}</p><p class="text-xs text-slate-500">Certificats</p></div>
              <div class="card text-center"><p class="text-2xl font-bold text-vc-primary">{{ kpiGlobal.seancesPlanifiees }}</p><p class="text-xs text-slate-500">Séances</p></div>
            </div>
          }

          @if (kpiEtab) {
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div class="card text-center"><p class="text-2xl font-bold text-vc-secondary">{{ kpiEtab.tauxAssiduite }}%</p><p class="text-xs text-slate-500">Assiduité</p></div>
              <div class="card text-center"><p class="text-2xl font-bold text-vc-secondary">{{ kpiEtab.tauxCompletion }}%</p><p class="text-xs text-slate-500">Complétion</p></div>
              <div class="card text-center"><p class="text-2xl font-bold text-vc-secondary">{{ kpiEtab.moyenneGenerale }}/20</p><p class="text-xs text-slate-500">Moyenne</p></div>
              <div class="card text-center"><p class="text-2xl font-bold text-vc-secondary">{{ kpiEtab.certificatsEmis }}</p><p class="text-xs text-slate-500">Certificats émis</p></div>
            </div>
          }

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @if (isAdminCentre) {
              <a routerLink="/admin/etablissements" class="card block no-underline cursor-pointer"><h3 class="font-bold">Établissements</h3><p class="text-sm text-slate-500 mt-1">Gérer les antennes du réseau</p></a>
              <a routerLink="/admin/utilisateurs" class="card block no-underline cursor-pointer"><h3 class="font-bold">Utilisateurs</h3><p class="text-sm text-slate-500 mt-1">Gérer les comptes</p></a>
              <a routerLink="/admin/analytics" class="card block no-underline cursor-pointer"><h3 class="font-bold">Analytics</h3><p class="text-sm text-slate-500 mt-1">KPI consolidés</p></a>
            }
            @if (isAdminEtab) {
              <a routerLink="/admin-etab/dashboard" class="card block no-underline cursor-pointer"><h3 class="font-bold">Mon établissement</h3><p class="text-sm text-slate-500 mt-1">Stats locales</p></a>
            }
            @if (isFormateur) {
              <a routerLink="/formations" class="card block no-underline cursor-pointer"><h3 class="font-bold">Formations</h3><p class="text-sm text-slate-500 mt-1">Créer et gérer le contenu</p></a>
              <a routerLink="/notes" class="card block no-underline cursor-pointer"><h3 class="font-bold">Notes</h3><p class="text-sm text-slate-500 mt-1">Saisir les évaluations</p></a>
              <a routerLink="/seances" class="card block no-underline cursor-pointer"><h3 class="font-bold">Séances</h3><p class="text-sm text-slate-500 mt-1">Planifier et émarger</p></a>
            }
            @if (isApprenant) {
              <a routerLink="/mes-cours" class="card block no-underline cursor-pointer"><h3 class="font-bold">Mes cours</h3><p class="text-sm text-slate-500 mt-1">E-learning 24/7</p></a>
              <a routerLink="/mes-quiz" class="card block no-underline cursor-pointer"><h3 class="font-bold">Mes quiz</h3><p class="text-sm text-slate-500 mt-1">Quiz automatiques</p></a>
              <a routerLink="/mes-devoirs" class="card block no-underline cursor-pointer"><h3 class="font-bold">Mes devoirs</h3><p class="text-sm text-slate-500 mt-1">Dépôt sécurisé</p></a>
              <a routerLink="/mes-certificats" class="card block no-underline cursor-pointer"><h3 class="font-bold">Mes certificats</h3><p class="text-sm text-slate-500 mt-1">Télécharger vos attestations</p></a>
            }
            @if (isFormateur) {
              <a routerLink="/devoirs/noter" class="card block no-underline cursor-pointer"><h3 class="font-bold">Corriger devoirs</h3><p class="text-sm text-slate-500 mt-1">Noter les soumissions</p></a>
            }
            @if (isPersonnel) {
              <a routerLink="/personnel/assiduite" class="card block no-underline cursor-pointer"><h3 class="font-bold">Assiduité</h3><p class="text-sm text-slate-500 mt-1">États de présence</p></a>
              <a routerLink="/seances" class="card block no-underline cursor-pointer"><h3 class="font-bold">Séances</h3><p class="text-sm text-slate-500 mt-1">Consulter le planning</p></a>
            }
          </div>
        </div>
      </div>
    </app-main-layout>
  `,
})
export class DashboardComponent implements OnInit {
  kpiGlobal: KpiGlobal | null = null;
  kpiEtab: KpiEtablissement | null = null;

  constructor(private authService: AuthService, private analytics: AnalyticsService) {}

  get user() { return this.authService.currentUser; }
  get isAdminCentre() { return this.user?.role === 'ADMIN_CENTRE'; }
  get isAdminEtab() { return this.user?.role === 'ADMIN_ETABLISSEMENT'; }
  get isFormateur() { return ['ADMIN_CENTRE', 'ADMIN_ETABLISSEMENT', 'FORMATEUR'].includes(this.user?.role ?? ''); }
  get isApprenant() { return this.user?.role === 'APPRENANT'; }
  get isPersonnel() { return ['PERSONNEL_ADMINISTRATIF', 'ADMIN_ETABLISSEMENT'].includes(this.user?.role ?? ''); }
  get canViewEtablissementKpi() { return this.isAdminEtab || this.isPersonnel; }

  get badgeClass(): string {
    const map: Record<string, string> = {
      ADMIN_CENTRE: 'badge badge-admin-centre',
      ADMIN_ETABLISSEMENT: 'badge badge-admin-etab',
      FORMATEUR: 'badge badge-formateur',
      PERSONNEL_ADMINISTRATIF: 'badge badge-personnel-admin',
      APPRENANT: 'badge badge-apprenant',
    };
    return map[this.user?.role ?? ''] || 'badge';
  }

  ngOnInit() {
    if (this.isAdminCentre) {
      this.analytics.getGlobal().subscribe({ next: (k) => this.kpiGlobal = k });
    }
    if (this.user?.etablissementId && this.canViewEtablissementKpi) {
      this.analytics.getEtablissement(this.user.etablissementId).subscribe({ next: (k) => this.kpiEtab = k });
    }
  }
}
