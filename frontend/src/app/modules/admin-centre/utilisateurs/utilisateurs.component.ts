import { Component, OnInit } from '@angular/core';
import { UtilisateursService } from '../../../core/services/utilisateurs.service';
import { MainLayoutComponent } from '../../../shared/layout/main-layout.component';
import { Utilisateur } from '../../../core/models';

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [MainLayoutComponent],
  template: `
    <app-main-layout>
      <div class="p-8 max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold text-vc-primary font-heading mb-8">Utilisateurs</h1>
        @if (loading) { <p>Chargement...</p> }
        @else {
          <div class="card overflow-hidden p-0">
            <table class="w-full">
              <thead><tr class="text-white text-left" style="background: var(--color-vc-primary);">
                <th class="px-4 py-3">Nom</th><th class="px-4 py-3">Email</th><th class="px-4 py-3">Rôle</th>
                <th class="px-4 py-3">Établissement</th><th class="px-4 py-3">Statut</th><th class="px-4 py-3">Actions</th>
              </tr></thead>
              <tbody>
                @for (u of utilisateurs; track u.id) {
                  <tr class="border-b hover:bg-slate-50">
                    <td class="px-4 py-3">{{ u.prenom }} {{ u.nom }}</td>
                    <td class="px-4 py-3 text-sm">{{ u.email }}</td>
                    <td class="px-4 py-3"><span class="badge badge-formateur text-[10px]">{{ u.role }}</span></td>
                    <td class="px-4 py-3 text-sm">{{ u.etablissement?.nom }}</td>
                    <td class="px-4 py-3">
                      <span class="badge" [class]="u.actif !== false ? 'badge-personnel-admin' : 'bg-slate-400 text-white'">
                        {{ u.actif !== false ? 'Actif' : 'Inactif' }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <button class="btn btn-outline text-xs py-1 px-2" (click)="toggleActif(u)">
                        {{ u.actif !== false ? 'Désactiver' : 'Activer' }}
                      </button>
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
export class UtilisateursComponent implements OnInit {
  utilisateurs: Utilisateur[] = [];
  loading = true;

  constructor(private service: UtilisateursService) {}

  ngOnInit() {
    this.service.getAll().subscribe({
      next: (d) => { this.utilisateurs = d; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  toggleActif(u: Utilisateur) {
    const actif = u.actif === false;
    this.service.setActif(u.id, actif).subscribe({
      next: () => { u.actif = actif; },
    });
  }
}
