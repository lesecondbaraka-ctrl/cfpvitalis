import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Utilisateur } from '../models';

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  utilisateur: Utilisateur;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/utilisateurs`;
  private currentUserSubject = new BehaviorSubject<Utilisateur | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('vitalis_token');
    if (token) {
      this.loadMe().subscribe();
    }
  }

  get currentUser(): Utilisateur | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!localStorage.getItem('vitalis_token');
  }

  get token(): string | null {
    return localStorage.getItem('vitalis_token');
  }

  loadMe(): Observable<Utilisateur | null> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        localStorage.setItem('vitalis_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res) => this.storeSession(res)),
    );
  }

  register(data: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    role: string;
    etablissementId: string;
  }): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  refreshToken(): Observable<{ accessToken: string; refreshToken: string }> {
    const refresh = localStorage.getItem('vitalis_refresh');
    return this.http.post<{ accessToken: string; refreshToken: string }>(`${this.apiUrl}/refresh`, { refreshToken: refresh }).pipe(
      tap((res) => {
        localStorage.setItem('vitalis_token', res.accessToken);
        localStorage.setItem('vitalis_refresh', res.refreshToken);
      }),
    );
  }

  private storeSession(res: AuthResponse): void {
    localStorage.setItem('vitalis_token', res.accessToken);
    localStorage.setItem('vitalis_refresh', res.refreshToken);
    localStorage.setItem('vitalis_user', JSON.stringify(res.utilisateur));
    this.currentUserSubject.next(res.utilisateur);
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  private clearSession(): void {
    localStorage.removeItem('vitalis_token');
    localStorage.removeItem('vitalis_refresh');
    localStorage.removeItem('vitalis_user');
    this.currentUserSubject.next(null);
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some((r) => this.currentUser?.role === r);
  }
}
