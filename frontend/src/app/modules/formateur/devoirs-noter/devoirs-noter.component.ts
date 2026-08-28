import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DevoirsService, Devoir, SoumissionDevoir } from '../../../core/services/devoirs.service';
import { PedagogieService } from '../../../core/services/pedagogie.service';
import { MainLayoutComponent } from '../../../shared/layout/main-layout.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-devoirs-noter',
  standalone: true,
  imports: [FormsModule, MainLayoutComponent, DatePipe],
  template: `
    <app-main-layout>
      <div class="p-8 max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-vc-primary font-heading mb-8">Correction des devoirs</h1>

        <div class="card mb-6">
          <label class="form-label">Sélectionner un devoir</label>
          <select class="form-input" [(ngModel)]="selectedDevoirId" (change)="loadSoumissions()">
            <option value="">— Choisir —</option>
            @for (d of devoirs; track d.id) {
              <option [value]="d.id">{{ d.titre }} ({{ d._count?.soumissions ?? 0 }} soumissions)</option>
            }
          </select>
        </div>

        @if (selectedDevoir) {
          <p class="text-sm text-slate-500 mb-4">{{ selectedDevoir.consignes }}</p>
          @for (s of selectedDevoir.soumissions; track s.id) {
            <div class="card mb-4">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="font-bold">{{ s.apprenant?.prenom }} {{ s.apprenant?.nom }}</h3>
                  <p class="text-xs text-slate-400">Déposé le {{ s.dateDepot | date:'dd/MM/yyyy' }}</p>
                </div>
                <a [href]="fileUrl(s.fileUrl)" target="_blank" class="btn btn-outline text-xs">Télécharger</a>
              </div>
              <div class="flex gap-4 items-end">
                <div><label class="form-label">Note /20</label>
                  <input class="form-input w-24" type="number" min="0" max="20" step="0.5" [(ngModel)]="notes[s.id]" /></div>
                <div class="flex-1"><label class="form-label">Commentaire</label>
                  <input class="form-input" [(ngModel)]="commentaires[s.id]" placeholder="Feedback..." /></div>
                <button class="btn btn-primary" (click)="noter(s)">Noter</button>
              </div>
            </div>
          } @empty {
            <p class="text-slate-500">Aucune soumission pour ce devoir.</p>
          }
        }
      </div>
    </app-main-layout>
  `,
})
export class DevoirsNoterComponent implements OnInit {
  devoirs: Devoir[] = [];
  selectedDevoirId = '';
  selectedDevoir: Devoir | null = null;
  notes: Record<string, number> = {};
  commentaires: Record<string, string> = {};

  constructor(
    private devoirsService: DevoirsService,
    private pedagogie: PedagogieService,
  ) {}

  ngOnInit() {
    this.pedagogie.getFormations().subscribe({
      next: (formations) => formations.forEach(f =>
        this.pedagogie.getFormation(f.id).subscribe({
          next: (full) => full.modules?.forEach(m =>
            this.devoirsService.getByModule(m.id).subscribe({
              next: (d) => this.devoirs.push(...d),
            }),
          ),
        }),
      ),
    });
  }

  loadSoumissions() {
    if (!this.selectedDevoirId) return;
    this.devoirsService.getOne(this.selectedDevoirId).subscribe({
      next: (d) => {
        this.selectedDevoir = d;
        d.soumissions?.forEach(s => {
          if (s.note != null) this.notes[s.id] = Number(s.note);
          if (s.commentaire) this.commentaires[s.id] = s.commentaire;
        });
      },
    });
  }

  fileUrl(url: string) {
    return url.startsWith('http') ? url : `${environment.apiUrl.replace('/api', '')}${url}`;
  }

  noter(s: SoumissionDevoir) {
    if (!this.selectedDevoirId || !s.apprenant) return;
    this.devoirsService.noter(this.selectedDevoirId, s.apprenant.id, this.notes[s.id], this.commentaires[s.id]).subscribe({
      next: () => this.loadSoumissions(),
    });
  }
}
