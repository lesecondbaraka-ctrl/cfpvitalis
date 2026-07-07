import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CertificationService } from '../../../core/services/certification.service';
import { MainLayoutComponent } from '../../../shared/layout/main-layout.component';
import { Certificat } from '../../../core/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-mes-certificats',
  standalone: true,
  imports: [MainLayoutComponent, DatePipe],
  template: `
    <app-main-layout>
      <div class="p-8 max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-vc-primary font-heading mb-8">Mes certificats</h1>
        @for (c of certificats; track c.id) {
          <div class="card mb-4 flex justify-between items-center">
            <div>
              <h3 class="font-bold">{{ c.formation?.titre }}</h3>
              <p class="text-sm text-slate-500">N° {{ c.numeroSerie }} — Moyenne : {{ c.moyenneGenerale }}/20</p>
              <p class="text-xs text-slate-400">Émis le {{ c.dateEmission | date:'dd/MM/yyyy' }}</p>
            </div>
            <button class="btn btn-primary" (click)="download(c.numeroSerie)">Télécharger PDF</button>
          </div>
        } @empty {
          <div class="card text-center p-12 text-slate-500">Aucun certificat obtenu pour le moment.</div>
        }
      </div>
    </app-main-layout>
  `,
})
export class MesCertificatsComponent implements OnInit {
  certificats: Certificat[] = [];

  constructor(private certification: CertificationService) {}

  ngOnInit() {
    this.certification.mesCertificats().subscribe({ next: (c) => this.certificats = c });
  }

  download(numeroSerie: string) {
    this.certification.getPdfUrl(numeroSerie).subscribe({
      next: (res) => {
        const url = res.url.startsWith('http') ? res.url : `${environment.apiUrl.replace('/api', '')}${res.url}`;
        window.open(url, '_blank');
      },
    });
  }
}
