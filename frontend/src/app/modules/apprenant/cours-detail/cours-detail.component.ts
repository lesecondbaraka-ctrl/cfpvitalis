import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PedagogieService } from '../../../core/services/pedagogie.service';
import { AuthService } from '../../../core/services/auth.service';
import { MainLayoutComponent } from '../../../shared/layout/main-layout.component';
import { Cours } from '../../../core/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-cours-detail',
  standalone: true,
  imports: [MainLayoutComponent],
  template: `
    <app-main-layout>
      <div class="p-8 max-w-4xl mx-auto">
        @if (cours) {
          <h1 class="text-3xl font-bold text-vc-primary font-heading mb-6">{{ cours.titre }}</h1>

          @if (cours.contenu) {
            <div class="card mb-6 prose max-w-none">
              <div [innerHTML]="cours.contenu"></div>
            </div>
          }

          @if (cours.fileUrl) {
            <div class="card mb-6">
              <h3 class="font-bold mb-4">Document de cours</h3>
              <iframe [src]="pdfUrl" class="w-full h-96 border rounded-lg"></iframe>
              <a [href]="fullFileUrl" target="_blank" class="btn btn-outline mt-4 inline-block">Ouvrir le PDF</a>
            </div>
          }

          @if (isApprenant) {
            <div class="card">
              @if (cours.complete) {
                <p class="text-vc-success font-bold">✓ Cours terminé</p>
              } @else {
                <button class="btn btn-primary" (click)="markComplete()" [disabled]="completing">
                  {{ completing ? 'En cours...' : 'Marquer comme terminé' }}
                </button>
              }
            </div>
          }
        } @else { <p>Chargement...</p> }
      </div>
    </app-main-layout>
  `,
})
export class CoursDetailComponent implements OnInit {
  cours: Cours | null = null;
  completing = false;
  pdfUrl = '';
  fullFileUrl = '';

  constructor(
    private route: ActivatedRoute,
    private pedagogie: PedagogieService,
    private auth: AuthService,
  ) {}

  get isApprenant() { return this.auth.hasRole('APPRENANT'); }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.pedagogie.getCours(id).subscribe({
      next: (c) => {
        this.cours = c;
        if (c.fileUrl) {
          this.fullFileUrl = c.fileUrl.startsWith('http') ? c.fileUrl : `${environment.apiUrl.replace('/api', '')}${c.fileUrl}`;
          this.pdfUrl = this.fullFileUrl;
        }
      },
    });
  }

  markComplete() {
    if (!this.cours) return;
    this.completing = true;
    this.pedagogie.markComplete(this.cours.id).subscribe({
      next: () => { if (this.cours) this.cours.complete = true; this.completing = false; },
      error: () => { this.completing = false; },
    });
  }
}
