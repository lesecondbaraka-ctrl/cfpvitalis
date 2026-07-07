import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PedagogieService } from '../../../core/services/pedagogie.service';
import { MainLayoutComponent } from '../../../shared/layout/main-layout.component';
import { Formation, ProgressInfo } from '../../../core/models';

@Component({
  selector: 'app-mes-cours',
  standalone: true,
  imports: [RouterLink, MainLayoutComponent],
  template: `
    <app-main-layout>
      <div class="p-8 max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold text-vc-primary font-heading mb-8">Mes cours</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (item of items; track item.formation.id) {
            <div class="card">
              <h3 class="font-bold text-vc-primary">{{ item.formation.titre }}</h3>
              <p class="text-sm text-slate-500 mt-1">{{ item.formation.description }}</p>
              <div class="mt-4">
                <div class="flex justify-between text-xs mb-1"><span>Progression</span><span>{{ item.progress?.completionRate ?? 0 }}%</span></div>
                <div class="w-full bg-slate-200 rounded-full h-2">
                  <div class="h-2 rounded-full" style="background: var(--color-vc-secondary); width: {{ item.progress?.completionRate ?? 0 }}%"></div>
                </div>
              </div>
              <div class="mt-4 space-y-1">
                @for (mod of item.formation.modules; track mod.id) {
                  @for (c of mod.cours; track c.id) {
                    <a [routerLink]="['/cours', c.id]" class="block text-sm text-vc-primary hover:underline">→ {{ c.titre }}</a>
                  }
                }
              </div>
            </div>
          }
        </div>
      </div>
    </app-main-layout>
  `,
})
export class MesCoursComponent implements OnInit {
  items: { formation: Formation; progress: ProgressInfo | null }[] = [];

  constructor(private pedagogie: PedagogieService) {}

  ngOnInit() {
    this.pedagogie.getFormations().subscribe({
      next: (formations) => {
        formations.forEach(f => {
          this.pedagogie.getFormation(f.id).subscribe({
            next: (full) => {
              this.pedagogie.getProgress(f.id).subscribe({
                next: (progress) => this.items.push({ formation: full, progress }),
                error: () => this.items.push({ formation: full, progress: null }),
              });
            },
          });
        });
      },
    });
  }
}
