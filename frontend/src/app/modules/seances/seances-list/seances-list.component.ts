import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SeancesService } from '../../../core/services/seances.service';
import { PedagogieService } from '../../../core/services/pedagogie.service';
import { MainLayoutComponent } from '../../../shared/layout/main-layout.component';
import { Seance, Formation } from '../../../core/models';

@Component({
  selector: 'app-seances-list',
  standalone: true,
  imports: [RouterLink, FormsModule, MainLayoutComponent, DatePipe],
  template: `
    <app-main-layout>
      <div class="p-8 max-w-6xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-vc-primary font-heading">Séances de formation</h1>
          <button class="btn btn-primary" (click)="showForm = !showForm">{{ showForm ? 'Annuler' : '+ Planifier' }}</button>
        </div>

        @if (showForm) {
          <div class="card mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label class="form-label">Module (via formation)</label>
              <select class="form-input" [(ngModel)]="form.moduleId">
                @for (m of allModules; track m.id) {
                  <option [value]="m.id">{{ m.formationTitre }} — {{ m.titre }}</option>
                }
              </select>
            </div>
            <div><label class="form-label">Titre activité</label><input class="form-input" [(ngModel)]="form.titreActivite" /></div>
            <div><label class="form-label">Type</label>
              <select class="form-input" [(ngModel)]="form.typeSession">
                <option value="THEORIQUE">Théorique</option><option value="PRATIQUE">Pratique</option>
                <option value="ATELIER">Atelier</option><option value="EVALUATION">Évaluation</option>
              </select>
            </div>
            <div><label class="form-label">Salle / Lien</label><input class="form-input" [(ngModel)]="form.salleOuLien" /></div>
            <div><label class="form-label">Début</label><input class="form-input" type="datetime-local" [(ngModel)]="form.dateHeureDebut" /></div>
            <div><label class="form-label">Fin</label><input class="form-input" type="datetime-local" [(ngModel)]="form.dateHeureFin" /></div>
            <button class="btn btn-primary md:col-span-2 w-fit" (click)="create()">Planifier la séance</button>
          </div>
        }

        <div class="space-y-4">
          @for (s of seances; track s.id) {
            <a [routerLink]="['/seances', s.id]" class="card block no-underline cursor-pointer">
              <div class="flex justify-between">
                <div>
                  <h3 class="font-bold">{{ s.titreActivite }}</h3>
                  <p class="text-sm text-slate-500">{{ s.module?.formation?.titre }} — {{ s.typeSession }}</p>
                  <p class="text-xs text-vc-secondary mt-1">{{ s.dateHeureDebut | date:'dd/MM/yyyy HH:mm' }} → {{ s.dateHeureFin | date:'HH:mm' }}</p>
                </div>
                <span class="badge badge-formateur">{{ s._count?.presences ?? 0 }} présences</span>
              </div>
            </a>
          }
        </div>
      </div>
    </app-main-layout>
  `,
})
export class SeancesListComponent implements OnInit {
  seances: Seance[] = [];
  allModules: { id: string; titre: string; formationTitre: string }[] = [];
  showForm = false;
  form = { moduleId: '', titreActivite: '', typeSession: 'THEORIQUE', dateHeureDebut: '', dateHeureFin: '', salleOuLien: '' };

  constructor(private seancesService: SeancesService, private pedagogie: PedagogieService) {}

  ngOnInit() {
    this.seancesService.getAll().subscribe({ next: (s) => this.seances = s });
    this.pedagogie.getFormations().subscribe({
      next: (formations) => formations.forEach(f =>
        this.pedagogie.getFormation(f.id).subscribe({
          next: (full) => full.modules?.forEach(m =>
            this.allModules.push({ id: m.id, titre: m.titre, formationTitre: full.titre }),
          ),
        }),
      ),
    });
  }

  create() {
    this.seancesService.create({
      ...this.form,
      dateHeureDebut: new Date(this.form.dateHeureDebut).toISOString(),
      dateHeureFin: new Date(this.form.dateHeureFin).toISOString(),
    }).subscribe({ next: () => { this.showForm = false; this.ngOnInit(); } });
  }
}
