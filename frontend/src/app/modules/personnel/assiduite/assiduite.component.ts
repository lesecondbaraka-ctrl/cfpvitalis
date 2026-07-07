import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { UtilisateursService } from '../../../core/services/utilisateurs.service';
import { SeancesService } from '../../../core/services/seances.service';
import { MainLayoutComponent } from '../../../shared/layout/main-layout.component';
import { Utilisateur } from '../../../core/models';

@Component({
  selector: 'app-assiduite',
  standalone: true,
  imports: [MainLayoutComponent],
  template: `
    <app-main-layout>
      <div class="p-8 max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-vc-primary font-heading mb-8">États d'assiduité</h1>
        <div class="card overflow-hidden p-0">
          <table class="w-full">
            <thead><tr class="text-white text-left" style="background: var(--color-vc-primary);">
              <th class="px-4 py-3">Apprenant</th><th class="px-4 py-3">Email</th><th class="px-4 py-3">Taux assiduité</th>
            </tr></thead>
            <tbody>
              @for (item of assiduiteData; track item.apprenant.id) {
                <tr class="border-b hover:bg-slate-50">
                  <td class="px-4 py-3">{{ item.apprenant.prenom }} {{ item.apprenant.nom }}</td>
                  <td class="px-4 py-3 text-sm">{{ item.apprenant.email }}</td>
                  <td class="px-4 py-3">
                    <span class="badge" [class]="item.taux >= 80 ? 'badge-personnel-admin' : 'bg-orange-500 text-white'">
                      {{ item.taux }}%
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </app-main-layout>
  `,
})
export class AssiduiteComponent implements OnInit {
  assiduiteData: { apprenant: Utilisateur; taux: number }[] = [];

  constructor(
    private auth: AuthService,
    private usersService: UtilisateursService,
    private seancesService: SeancesService,
  ) {}

  ngOnInit() {
    const etabId = this.auth.currentUser?.etablissementId;
    if (!etabId) return;
    this.usersService.getByEtablissement(etabId).subscribe({
      next: (users) => {
        users.filter(u => u.role === 'APPRENANT').forEach(a => {
          this.seancesService.getAssiduite(a.id).subscribe({
            next: (res) => this.assiduiteData.push({ apprenant: a, taux: res.tauxAssiduite }),
          });
        });
      },
    });
  }
}
