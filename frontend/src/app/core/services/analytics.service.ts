import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { KpiGlobal, KpiEtablissement } from '../models';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private url = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  getGlobal(): Observable<KpiGlobal> {
    return this.http.get<KpiGlobal>(`${this.url}/global`);
  }

  getEtablissement(id: string): Observable<KpiEtablissement> {
    return this.http.get<KpiEtablissement>(`${this.url}/etablissement/${id}`);
  }

  getEtablissementDashboardDetails(id: string): Observable<any> {
    return this.http.get<any>(`${this.url}/etablissement/${id}/dashboard-details`);
  }

  getFormation(id: string): Observable<unknown> {
    return this.http.get(`${this.url}/formation/${id}`);
  }

}
