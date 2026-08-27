import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Certificat } from '../models';

export interface VerificationResult {
  success: boolean;
  valide: boolean;
  certificat: Certificat;
}

@Injectable({ providedIn: 'root' })
export class CertificationService {
  private url = `${environment.apiUrl}/certification`;
  private verifCache = new Map<string, VerificationResult>();

  constructor(private http: HttpClient) {}

  emettre(formationId: string, utilisateurId: string): Observable<unknown> {
    return this.http.post(`${this.url}/emettre/${formationId}/${utilisateurId}`, {});
  }

  mesCertificats(): Observable<Certificat[]> {
    return this.http.get<Certificat[]>(`${this.url}/mes-certificats`);
  }

  getVerificationSnapshot(numeroSerie: string): VerificationResult | null {
    if (!numeroSerie) return null;
    return this.verifCache.get(numeroSerie.trim().toUpperCase()) || null;
  }

  verifier(numeroSerie: string): Observable<VerificationResult> {
    const cleanNum = (numeroSerie || '').trim().toUpperCase();
    return this.http.get<VerificationResult>(`${this.url}/verifier/${encodeURIComponent(cleanNum)}`).pipe(
      tap((result) => {
        if (result && result.valide) {
          this.verifCache.set(cleanNum, result);
        }
      })
    );
  }

  getPdfUrl(numeroSerie: string): Observable<{ url: string; numeroSerie: string }> {
    return this.http.get<{ url: string; numeroSerie: string }>(`${this.url}/download/${numeroSerie}`);
  }
}

