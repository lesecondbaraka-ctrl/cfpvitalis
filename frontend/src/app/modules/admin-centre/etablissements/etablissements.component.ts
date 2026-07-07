import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EtablissementsService } from '../../../core/services/etablissements.service';
import { MainLayoutComponent } from '../../../shared/layout/main-layout.component';
import { Etablissement } from '../../../core/models';

@Component({
  selector: 'app-etablissements',
  standalone: true,
  imports: [FormsModule, MainLayoutComponent],
  template: `
    <app-main-layout>
      <div class="p-8 max-w-6xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-vc-primary font-heading">Établissements</h1>
          <button class="btn btn-primary" (click)="showForm = !showForm">{{ showForm ? 'Annuler' : '+ Nouvel établissement' }}</button>
        </div>

        @if (showForm) {
          <div class="card mb-6">
            <h3 class="font-bold mb-4">{{ editing ? 'Modifier' : 'Créer' }} un établissement</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label class="form-label">Nom</label><input class="form-input" [(ngModel)]="form.nom" /></div>
              <div><label class="form-label">Code antenne</label><input class="form-input" [(ngModel)]="form.codeAntenne" placeholder="Auto si vide" /></div>
              <div class="md:col-span-2"><label class="form-label">Adresse</label><input class="form-input" [(ngModel)]="form.adresse" /></div>
            </div>
            <div class="mt-4 flex gap-2">
              <button class="btn btn-primary" (click)="save()">{{ editing ? 'Mettre à jour' : 'Créer' }}</button>
            </div>
            @if (message) { <p class="text-sm mt-2 text-vc-success">{{ message }}</p> }
          </div>
        }

        @if (loading) { <p>Chargement...</p> }
        @else {
          <div class="card overflow-hidden p-0">
            <table class="w-full">
              <thead><tr class="text-white text-left" style="background: var(--color-vc-primary);">
                <th class="px-4 py-3">Nom</th><th class="px-4 py-3">Code</th><th class="px-4 py-3">Adresse</th>
                <th class="px-4 py-3">Users</th><th class="px-4 py-3">Formations</th><th class="px-4 py-3">Actions</th>
              </tr></thead>
              <tbody>
                @for (e of etablissements; track e.id) {
                  <tr class="border-b hover:bg-slate-50">
                    <td class="px-4 py-3 font-medium">{{ e.nom }}</td>
                    <td class="px-4 py-3 text-sm">{{ e.codeAntenne }}</td>
                    <td class="px-4 py-3 text-sm text-slate-500">{{ e.adresse }}</td>
                    <td class="px-4 py-3">{{ e._count?.utilisateurs ?? 0 }}</td>
                    <td class="px-4 py-3">{{ e._count?.formations ?? 0 }}</td>
                    <td class="px-4 py-3 space-x-2">
                      <button class="btn btn-outline text-xs py-1 px-2" (click)="edit(e)">Modifier</button>
                      <button class="btn btn-outline text-xs py-1 px-2 text-vc-danger" (click)="remove(e.id)">Supprimer</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </app-main-layout>
  `,
})
export class EtablissementsComponent implements OnInit {
  etablissements: Etablissement[] = [];
  loading = true;
  showForm = false;
  editing: Etablissement | null = null;
  message = '';
  form = { nom: '', adresse: '', codeAntenne: '' };

  constructor(private service: EtablissementsService) {}

  ngOnInit() { this.load(); }

  load() {
    this.service.getAll().subscribe({
      next: (d) => { this.etablissements = d; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  edit(e: Etablissement) {
    this.editing = e;
    this.form = { nom: e.nom, adresse: e.adresse ?? '', codeAntenne: e.codeAntenne ?? '' };
    this.showForm = true;
  }

  save() {
    const obs = this.editing
      ? this.service.update(this.editing.id, { nom: this.form.nom, adresse: this.form.adresse })
      : this.service.create(this.form);
    obs.subscribe({
      next: () => { this.message = 'Enregistré avec succès'; this.showForm = false; this.editing = null; this.form = { nom: '', adresse: '', codeAntenne: '' }; this.load(); },
    });
  }

  remove(id: string) {
    if (confirm('Supprimer cet établissement ?')) {
      this.service.delete(id).subscribe({ next: () => this.load() });
    }
  }
}
