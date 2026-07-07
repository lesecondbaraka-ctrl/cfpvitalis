import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { MainLayoutComponent } from '../../../shared/layout/main-layout.component';
import { KpiGlobal } from '../../../core/models';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [MainLayoutComponent],
  template: `
    <app-main-layout>
      <div class="p-8 max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold text-vc-primary font-heading mb-8">Analytics — Vue globale</h1>
        @if (kpi) {
          <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div class="card text-center p-8"><p class="text-4xl font-bold text-vc-primary">{{ kpi.etablissements }}</p><p class="text-sm text-slate-500 mt-2">Établissements</p></div>
            <div class="card text-center p-8"><p class="text-4xl font-bold text-vc-primary">{{ kpi.apprenants }}</p><p class="text-sm text-slate-500 mt-2">Apprenants actifs</p></div>
            <div class="card text-center p-8"><p class="text-4xl font-bold text-vc-primary">{{ kpi.formateurs }}</p><p class="text-sm text-slate-500 mt-2">Formateurs</p></div>
            <div class="card text-center p-8"><p class="text-4xl font-bold text-vc-secondary">{{ kpi.formations }}</p><p class="text-sm text-slate-500 mt-2">Formations</p></div>
            <div class="card text-center p-8"><p class="text-4xl font-bold text-vc-secondary">{{ kpi.certificatsEmis }}</p><p class="text-sm text-slate-500 mt-2">Certificats émis</p></div>
            <div class="card text-center p-8"><p class="text-4xl font-bold text-vc-secondary">{{ kpi.seancesPlanifiees }}</p><p class="text-sm text-slate-500 mt-2">Séances planifiées</p></div>
          </div>
        } @else { <p>Chargement des KPI...</p> }
      </div>
    </app-main-layout>
  `,
})
export class AnalyticsComponent implements OnInit {
  kpi: KpiGlobal | null = null;
  constructor(private analytics: AnalyticsService) {}
  ngOnInit() {
    this.analytics.getGlobal().subscribe({ next: (k) => this.kpi = k });
  }
}
