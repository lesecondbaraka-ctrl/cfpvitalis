import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Certificat } from '../models';

@Injectable({ providedIn: 'root' })
export class CertificationService {
  private url = `${environment.apiUrl}/certification`;

  constructor(private http: HttpClient) {}

  emettre(formationId: string, utilisateurId: string): Observable<unknown> {
    return this.http.post(`${this.url}/emettre/${formationId}/${utilisateurId}`, {});
  }

  mesCertificats(): Observable<Certificat[]> {
    return this.http.get<Certificat[]>(`${this.url}/mes-certificats`);
  }

  verifier(numeroSerie: string): Observable<{ success: boolean; valide: boolean; certificat: Certificat }> {
    return this.http.get<{ success: boolean; valide: boolean; certificat: Certificat }>(`${this.url}/verifier/${numeroSerie}`);
  }

  getPdfUrl(numeroSerie: string): Observable<{ url: string; numeroSerie: string }> {
    return this.http.get<{ url: string; numeroSerie: string }>(`${this.url}/download/${numeroSerie}`);
  }
}
