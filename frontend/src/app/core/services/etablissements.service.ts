import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Etablissement } from '../models';

@Injectable({ providedIn: 'root' })
export class EtablissementsService {
  private url = `${environment.apiUrl}/etablissements`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Etablissement[]> {
    return this.http.get<Etablissement[]>(this.url);
  }

  getPublicList(): Observable<Etablissement[]> {
    return this.http.get<Etablissement[]>(`${this.url}/list/public`);
  }

  getOne(id: string): Observable<Etablissement> {
    return this.http.get<Etablissement>(`${this.url}/${id}`);
  }

  create(data: { nom: string; adresse: string; codeAntenne?: string }): Observable<Etablissement> {
    return this.http.post<Etablissement>(this.url, data);
  }

  update(id: string, data: { nom?: string; adresse?: string }): Observable<Etablissement> {
    return this.http.put<Etablissement>(`${this.url}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
