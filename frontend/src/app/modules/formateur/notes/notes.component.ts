import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PedagogieService } from '../../../core/services/pedagogie.service';
import { MainLayoutComponent } from '../../../shared/layout/main-layout.component';
import { Formation, Evaluation, Utilisateur } from '../../../core/models';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [FormsModule, MainLayoutComponent],
  template: `
    <app-main-layout>
      <div class="p-8 max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-vc-primary font-heading mb-8">Saisie des notes</h1>

        <div class="card mb-6">
          <label class="form-label">Formation</label>
          <select class="form-input" [(ngModel)]="selectedFormationId" (change)="onFormationChange()">
            <option value="">— Sélectionner —</option>
            @for (f of formations; track f.id) {
              <option [value]="f.id">{{ f.titre }}</option>
            }
          </select>
        </div>

        @if (evaluations.length) {
          <div class="card mb-6">
            <label class="form-label">Évaluation</label>
            <select class="form-input" [(ngModel)]="selectedEvalId">
              @for (e of evaluations; track e.id) {
                <option [value]="e.id">{{ e.titre }}</option>
              }
            </select>
          </div>

          <div class="card mb-6">
            <label class="form-label">Apprenant</label>
            <select class="form-input" [(ngModel)]="selectedApprenantId">
              @for (a of apprenants; track a.id) {
                <option [value]="a.id">{{ a.prenom }} {{ a.nom }} — {{ a.email }}</option>
              }
            </select>
          </div>

          <div class="card mb-6">
            <label class="form-label">Note (/20)</label>
            <input class="form-input w-32" type="number" min="0" max="20" step="0.5" [(ngModel)]="noteValue" />
          </div>

          <button class="btn btn-primary" (click)="submit()">Enregistrer la note</button>
          @if (message) { <p class="text-sm mt-4 text-vc-success">{{ message }}</p> }
        }
      </div>
    </app-main-layout>
  `,
})
export class NotesComponent implements OnInit {
  formations: Formation[] = [];
  evaluations: Evaluation[] = [];
  apprenants: Utilisateur[] = [];
  selectedFormationId = '';
  selectedEvalId = '';
  selectedApprenantId = '';
  noteValue = 10;
  message = '';

  constructor(private pedagogie: PedagogieService) {}

  ngOnInit() {
    this.pedagogie.getFormations().subscribe({ next: (f) => this.formations = f });
    this.pedagogie.getApprenants().subscribe({ next: (a) => this.apprenants = a });
  }

  onFormationChange() {
    this.evaluations = [];
    const formation = this.formations.find(f => f.id === this.selectedFormationId);
    if (!formation) return;
    this.pedagogie.getFormation(this.selectedFormationId).subscribe({
      next: (f) => {
        const allEvals: Evaluation[] = [];
        f.modules?.forEach(m => m.evaluations?.forEach(e => allEvals.push(e)));
        if (!allEvals.length && f.modules?.length) {
          f.modules.forEach(m => this.pedagogie.getEvaluations(m.id).subscribe({ next: (ev) => this.evaluations.push(...ev) }));
        } else {
          this.evaluations = allEvals;
        }
      },
    });
  }

  submit() {
    if (!this.selectedEvalId || !this.selectedApprenantId) return;
    this.pedagogie.submitNote(this.selectedEvalId, this.selectedApprenantId, this.noteValue).subscribe({
      next: () => { this.message = 'Note enregistrée avec succès'; },
      error: (e) => { this.message = e.error?.message || 'Erreur'; },
    });
  }
}
