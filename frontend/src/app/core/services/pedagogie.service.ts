import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Formation, Cours, Evaluation, Utilisateur, ProgressInfo, Module } from '../models';

@Injectable({ providedIn: 'root' })
export class PedagogieService {
  private url = `${environment.apiUrl}/pedagogie`;

  constructor(private http: HttpClient) {}

  getFormations(): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.url}/formations`);
  }

  getFormation(id: string): Observable<Formation> {
    return this.http.get<Formation>(`${this.url}/formations/${id}`);
  }

  createFormation(data: { titre: string; description: string }): Observable<Formation> {
    return this.http.post<Formation>(`${this.url}/formations`, data);
  }

  updateFormation(id: string, data: { titre?: string; description?: string }): Observable<Formation> {
    return this.http.put<Formation>(`${this.url}/formations/${id}`, data);
  }

  deleteFormation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/formations/${id}`);
  }

  createModule(formationId: string, data: { titre: string; coefficient?: number }): Observable<Module> {
    return this.http.post<Module>(`${this.url}/formations/${formationId}/modules`, data);
  }

  createCours(moduleId: string, data: { titre: string; contenu?: string }): Observable<Cours> {
    return this.http.post<Cours>(`${this.url}/modules/${moduleId}/cours`, data);
  }

  getCours(id: string): Observable<Cours> {
    return this.http.get<Cours>(`${this.url}/cours/${id}`);
  }

  markComplete(coursId: string): Observable<unknown> {
    return this.http.post(`${this.url}/cours/${coursId}/complete`, {});
  }

  uploadCoursFile(coursId: string, file: File): Observable<Cours> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<Cours>(`${this.url}/cours/${coursId}/upload`, form);
  }

  getProgress(formationId: string, apprenantId?: string): Observable<ProgressInfo> {
    const params = apprenantId ? `?apprenantId=${apprenantId}` : '';
    return this.http.get<ProgressInfo>(`${this.url}/formations/${formationId}/progress${params}`);
  }

  getApprenants(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.url}/apprenants`);
  }

  createEvaluation(moduleId: string, data: { titre: string; noteMaximale?: number }): Observable<Evaluation> {
    return this.http.post<Evaluation>(`${this.url}/modules/${moduleId}/evaluations`, data);
  }

  getEvaluations(moduleId: string): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.url}/modules/${moduleId}/evaluations`);
  }

  submitNote(evaluationId: string, utilisateurId: string, valeur: number): Observable<unknown> {
    return this.http.post(`${this.url}/evaluations/${evaluationId}/notes`, { utilisateurId, valeur });
  }
}
