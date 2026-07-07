import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PedagogieService } from '../../../core/services/pedagogie.service';
import { DevoirsService, Devoir, SoumissionDevoir } from '../../../core/services/devoirs.service';
import { MainLayoutComponent } from '../../../shared/layout/main-layout.component';

@Component({
  selector: 'app-mes-devoirs',
  standalone: true,
  imports: [MainLayoutComponent, DatePipe],
  template: `
    <app-main-layout>
      <div class="p-8 max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-vc-primary font-heading mb-8">Mes devoirs</h1>

        <h2 class="font-bold text-vc-secondary mb-4">Devoirs à rendre</h2>
        <div class="space-y-3 mb-8">
          @for (d of availableDevoirs; track d.id) {
            <div class="card">
              <h3 class="font-bold">{{ d.titre }}</h3>
              <p class="text-sm text-slate-500 mt-1">{{ d.consignes }}</p>
              @if (d.dateLimite) {
                <p class="text-xs text-vc-warning mt-1">Date limite : {{ d.dateLimite | date:'dd/MM/yyyy HH:mm' }}</p>
              }
              <div class="mt-4 flex items-center gap-4">
                <label class="btn btn-primary text-sm cursor-pointer">
                  Déposer mon devoir
                  <input type="file" class="hidden" accept=".pdf,.doc,.docx,.zip" (change)="submitDevoir(d.id, $event)" />
                </label>
                @if (isSubmitted(d.id)) {
                  <span class="badge badge-personnel-admin">Déposé ✓</span>
                }
              </div>
            </div>
          } @empty {
            <p class="text-slate-500">Aucun devoir en cours.</p>
          }
        </div>

        <h2 class="font-bold text-vc-secondary mb-4">Mes soumissions</h2>
        @for (s of soumissions; track s.id) {
          <div class="card mb-3 flex justify-between items-center">
            <div>
              <h3 class="font-medium">{{ s.devoir?.titre }}</h3>
              <p class="text-xs text-slate-500">{{ s.devoir?.module?.formation?.titre }}</p>
              <p class="text-xs text-slate-400">Déposé le {{ s.dateDepot | date:'dd/MM/yyyy' }}</p>
            </div>
            <div class="text-right">
              @if (s.note != null) {
                <span class="badge badge-formateur">{{ s.note }}/20</span>
                @if (s.commentaire) { <p class="text-xs text-slate-500 mt-1">{{ s.commentaire }}</p> }
              } @else {
                <span class="badge bg-slate-400 text-white">En attente</span>
              }
            </div>
          </div>
        }
      </div>
    </app-main-layout>
  `,
})
export class MesDevoirsComponent implements OnInit {
  availableDevoirs: Devoir[] = [];
  soumissions: SoumissionDevoir[] = [];
  submittedIds = new Set<string>();

  constructor(private pedagogie: PedagogieService, private devoirsService: DevoirsService) {}

  ngOnInit() {
    this.devoirsService.mesSoumissions().subscribe({
      next: (s) => {
        this.soumissions = s;
        s.forEach(sub => {
          if (sub.devoirId) this.submittedIds.add(sub.devoirId);
          else if (sub.devoir?.id) this.submittedIds.add(sub.devoir.id);
        });
      },
    });
    this.pedagogie.getFormations().subscribe({
      next: (formations) => formations.forEach(f =>
        this.pedagogie.getFormation(f.id).subscribe({
          next: (full) => full.modules?.forEach(m =>
            this.devoirsService.getByModule(m.id).subscribe({
              next: (devoirs) => this.availableDevoirs.push(...devoirs),
            }),
          ),
        }),
      ),
    });
  }

  isSubmitted(devoirId: string) {
    return this.submittedIds.has(devoirId);
  }

  submitDevoir(devoirId: string, event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.devoirsService.submit(devoirId, file).subscribe({ next: () => this.ngOnInit() });
  }
}
