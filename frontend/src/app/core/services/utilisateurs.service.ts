import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Utilisateur } from '../models';

@Injectable({ providedIn: 'root' })
export class UtilisateursService {
  private url = `${environment.apiUrl}/utilisateurs`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.url}/all`);
  }

  getByEtablissement(etablissementId: string): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.url}/etablissement/${etablissementId}`);
  }

  setActif(id: string, actif: boolean): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.url}/${id}/activer`, { actif });
  }
}
