import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SlicePipe } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [SlicePipe],
  template: `
    <div class="min-h-screen bg-vc-bg flex items-center justify-center p-8">
      <div class="max-w-2xl w-full">
        <h1 class="text-center mb-8 text-vc-primary font-heading font-bold text-3xl">Vérification de Certificat</h1>
        @if (loading) {
          <div class="card text-center p-6"><p class="text-vc-text text-sm">Vérification en cours...</p></div>
        } @else if (result && result.valide) {
          <div class="card border-l-4 border-vc-success">
            <div class="flex items-center gap-4 mb-4">
              <div class="text-5xl">✅</div>
              <div>
                <h3 class="text-xl font-bold text-vc-success font-heading">Certificat Valide</h3>
                <p class="text-xs text-slate-500">Numéro : {{ result.certificat.numeroSerie }}</p>
              </div>
            </div>
            <hr class="my-4 border-slate-100">
            <p class="text-sm text-vc-text mb-2"><strong>Titulaire :</strong> {{ result.certificat.utilisateur?.prenom }} {{ result.certificat.utilisateur?.nom }}</p>
            <p class="text-sm text-vc-text mb-2"><strong>Formation :</strong> {{ result.certificat.formation?.titre }}</p>
            <p class="text-sm text-vc-text mb-2"><strong>Établissement :</strong> {{ result.certificat.formation?.etablissement?.nom }}</p>
            <p class="text-sm text-vc-text"><strong>Émis le :</strong> {{ result.certificat.dateEmission | slice:0:10 }}</p>
          </div>
        } @else if (error) {
          <div class="card border-l-4 border-vc-danger text-center p-6">
            <div class="text-5xl mb-2">❌</div>
            <h3 class="text-xl font-bold text-vc-danger font-heading">Certificat Invalide</h3>
            <p class="text-slate-500">{{ error }}</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class VerifyComponent implements OnInit {
  result: any = null;
  loading = true;
  error = '';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    const num = this.route.snapshot.paramMap.get('numeroSerie');
    this.http.get(`${environment.apiUrl}/certification/verifier/${num}`).subscribe({
      next: (data) => { this.result = data; this.loading = false; },
      error: (e) => { this.error = e.error?.message || 'Certificat introuvable.'; this.loading = false; },
    });
  }
}
