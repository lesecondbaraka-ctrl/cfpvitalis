import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PedagogieService } from '../../../core/services/pedagogie.service';
import { MainLayoutComponent } from '../../../shared/layout/main-layout.component';
import { Formation } from '../../../core/models';

@Component({
  selector: 'app-formations',
  standalone: true,
  imports: [RouterLink, FormsModule, MainLayoutComponent],
  template: `
    <app-main-layout>
      <div class="p-8 max-w-6xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-vc-primary font-heading">Formations</h1>
          <button class="btn btn-primary" (click)="showForm = !showForm">{{ showForm ? 'Annuler' : '+ Nouvelle formation' }}</button>
        </div>

        @if (showForm) {
          <div class="card mb-6">
            <div class="grid gap-4">
              <div><label class="form-label">Titre</label><input class="form-input" [(ngModel)]="form.titre" /></div>
              <div><label class="form-label">Description</label><textarea class="form-input" rows="3" [(ngModel)]="form.description"></textarea></div>
              <button class="btn btn-primary w-fit" (click)="create()">Créer</button>
            </div>
          </div>
        }

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (f of formations; track f.id) {
            <a [routerLink]="['/formations', f.id]" class="card block no-underline cursor-pointer">
              <h3 class="font-bold text-vc-primary">{{ f.titre }}</h3>
              <p class="text-sm text-slate-500 mt-2">{{ f.description }}</p>
              <p class="text-xs text-vc-secondary mt-3">{{ f.modules?.length ?? 0 }} modules</p>
            </a>
          }
        </div>
      </div>
    </app-main-layout>
  `,
})
export class FormationsComponent implements OnInit {
  formations: Formation[] = [];
  showForm = false;
  form = { titre: '', description: '' };

  constructor(private pedagogie: PedagogieService) {}

  ngOnInit() {
    this.pedagogie.getFormations().subscribe({ next: (f) => this.formations = f });
  }

  create() {
    this.pedagogie.createFormation(this.form).subscribe({
      next: () => { this.showForm = false; this.form = { titre: '', description: '' }; this.ngOnInit(); },
    });
  }
}
