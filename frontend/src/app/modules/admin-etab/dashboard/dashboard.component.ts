import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { UtilisateursService } from '../../../core/services/utilisateurs.service';
import { MainLayoutComponent } from '../../../shared/layout/main-layout.component';
import { KpiEtablissement, Utilisateur } from '../../../core/models';

@Component({
  selector: 'app-admin-etab-dashboard',
  standalone: true,
  imports: [MainLayoutComponent, RouterLink],
  template: `
    <app-main-layout>
      <div class="p-8 max-w-6xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold text-vc-primary font-heading">Mon établissement</h1>
            <p class="text-xs text-slate-500 mt-1">Supervision des activités, utilisateurs et sessions d'admission</p>
          </div>
          <a routerLink="/admin-etab/sessions-admission" class="btn btn-primary text-xs font-semibold py-2 px-4">
            🎯 Gérer les Admissions & Candidatures
          </a>
        </div>
        @if (kpi) {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div class="card text-center"><p class="text-3xl font-bold text-vc-primary">{{ kpi.apprenants }}</p><p class="text-xs text-slate-500">Apprenants</p></div>
            <div class="card text-center"><p class="text-3xl font-bold text-vc-primary">{{ kpi.tauxAssiduite }}%</p><p class="text-xs text-slate-500">Assiduité</p></div>
            <div class="card text-center"><p class="text-3xl font-bold text-vc-secondary">{{ kpi.tauxCompletion }}%</p><p class="text-xs text-slate-500">Complétion</p></div>
            <div class="card text-center"><p class="text-3xl font-bold text-vc-secondary">{{ kpi.moyenneGenerale }}/20</p><p class="text-xs text-slate-500">Moyenne</p></div>
          </div>
        }
        <div class="card">
          <h3 class="font-bold mb-4">Utilisateurs de l'établissement</h3>
          <table class="w-full text-sm">
            @for (u of users; track u.id) {
              <tr class="border-b"><td class="py-2">{{ u.prenom }} {{ u.nom }}</td><td>{{ u.email }}</td><td><span class="badge badge-formateur text-[10px]">{{ u.role }}</span></td></tr>
            }
          </table>
        </div>
      </div>
    </app-main-layout>
  `,
})
export class AdminEtabDashboardComponent implements OnInit {
  kpi: KpiEtablissement | null = null;
  users: Utilisateur[] = [];

  constructor(private auth: AuthService, private analytics: AnalyticsService, private usersService: UtilisateursService) {}

  ngOnInit() {
    const etabId = this.auth.currentUser?.etablissementId;
    if (etabId) {
      this.analytics.getEtablissement(etabId).subscribe({ next: (k) => this.kpi = k });
      this.usersService.getByEtablissement(etabId).subscribe({ next: (u) => this.users = u });
    }
  }
}
