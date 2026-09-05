import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { tap, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { NotificationPayload } from './notifications.service';

export interface ApprenantDashboard {
  completionGlobale: number;
  formationsActives: Array<{
    id: string;
    titre: string;
    description: string;
    nbModules: number;
    totalCours: number;
    coursCompletes: number;
    pourcentage: number;
    certifie: boolean;
    certificatId: string | null;
  }>;
  nbFormations: number;
  nbQuizPasses: number;
  nbDevoirsDeposes: number;
  nbCertificats: number;
  prochaineEcheance: {
    type: 'devoir' | 'seance';
    id: string;
    titre: string;
    formationTitre: string;
    dateLimite: string;
  } | null;
}

export interface ApprenantFormation {
  id: string;
  titre: string;
  description: string;
  createdAt: string;
  etablissement?: { id: string; nom: string; codeAntenne: string };
  nbModules: number;
  totalCours: number;
  coursCompletes: number;
  totalQuiz?: number;
  totalDevoirs?: number;
  pourcentage: number;
  estCertifie: boolean;
  certificat: {
    id: string;
    numeroSerie: string;
    dateEmission: string;
  } | null;
}

export interface FormationArborescence {
  formation: {
    id: string;
    titre: string;
    description: string;
    etablissement: { id: string; nom: string; codeAntenne: string };
    progressionGlobale: number;
    certificat: { id: string; numeroSerie: string; dateEmission: string } | null;
  };
  modules: Array<{
    id: string;
    titre: string;
    ordre: number;
    coefficient: number;
    statut: 'non_commence' | 'en_cours' | 'termine';
    pourcentage: number;
    totalCours: number;
    completedCours: number;
    cours: Array<{
      id: string;
      titre: string;
      hasMedia: boolean;
      hasText: boolean;
      complete: boolean;
      dateTerminaison: string | null;
    }>;
    quiz: Array<{
      id: string;
      titre: string;
      dureeMinutes: number | null;
      passe: boolean;
      score: number | null;
      datePassage: string | null;
    }>;
    devoirs: Array<{
      id: string;
      titre: string;
      consignes: string | null;
      dateLimite: string | null;
      estEnRetard: boolean;
      soumis: boolean;
      note: number | null;
      commentaire: string | null;
      dateDepot: string | null;
    }>;
  }>;
}

export interface EligibiliteCertificat {
  eligible: boolean;
  completionRate: number;
  moyenne: number;
  raison: string | null;
  dejaEmis: boolean;
  certificat: {
    id: string;
    numeroSerie: string;
    dateEmission: string;
    urlPdfS3: string;
  } | null;
}

export interface CoursContenu {
  id: string;
  titre: string;
  contenu: string | null;
  fileUrl: string | null;
  module: { id: string; titre: string };
  formation: { id: string; titre: string };
  complete: boolean;
  dateTerminaison: string | null;
}

export interface QuizQuestion {
  id: string;
  enonce: string;
  ordre: number;
  options: Array<{ text: string }>;
}

export interface QuizDetail {
  id: string;
  titre: string;
  dureeMinutes: number | null;
  moduleId: string;
  formationTitre: string;
  totalQuestions: number;
  questions: QuizQuestion[];
  tentative: {
    id: string;
    score: number;
    datePassage: string;
    dejaPasse: boolean;
  } | null;
}

export interface QuizSubmissionResult {
  success: boolean;
  tentativeId: string;
  score: number;
  bonnesReponses: number;
  totalQuestions: number;
  datePassage: string;
  detailsCorrection: Array<{
    questionId: string;
    enonce: string;
    selectedIndex: number;
    estCorrect: boolean;
  }>;
}

export interface ApprenantQuizItem {
  id: string;
  titre: string;
  dureeMinutes: number | null;
  nbQuestions: number;
  moduleId: string;
  moduleTitre: string;
  formationId: string;
  formationTitre: string;
  tentative: {
    id: string;
    score: number;
    datePassage: string;
  } | null;
}

export interface ApprenantCertificat {
  id: string;
  numeroSerie: string;
  hashVerification: string;
  moyenneGenerale: number;
  dateEmission: string;
  urlPdfS3: string;
  formation: {
    id: string;
    titre: string;
    description: string;
    etablissement: { nom: string; codeAntenne: string };
  };
}

@Injectable({
  providedIn: 'root',
})
export class ApprenantService {
  private apiUrl = `${environment.apiUrl}/apprenant`;

  private readonly CACHE_KEYS = {
    DASHBOARD: 'vc_apprenant_dashboard',
    FORMATIONS: 'vc_apprenant_formations',
    MODULES_PREFIX: 'vc_apprenant_modules_',
    CERTIFICATS: 'vc_apprenant_certificats',
    DEVOIRS: 'vc_apprenant_devoirs',
    QUIZ_LIST: 'vc_apprenant_quiz_list',
    QUIZ_PREFIX: 'vc_apprenant_quiz_detail_',
  };

  constructor(private http: HttpClient) {}

  // ───────────────────────────────────────────────────────────
  // BUS TEMPS RÉEL — événements SSE reçus et distribués aux composants
  // ───────────────────────────────────────────────────────────
  /** Bus interne : chaque message SSE reçu est relayé ici. */
  readonly liveUpdates$ = new Subject<NotificationPayload>();

  /**
   * Appelé par ApprenantShellComponent lors de la réception d'un événement SSE.
   * Invalide le cache puis recharge les données concernées en arrière-plan.
   */
  triggerRealtimeRefresh(event: NotificationPayload): void {
    // 1. Invalider les caches pertinents selon le type d'événement
    switch (event.type) {
      case 'DEVOIR_NOTE':
        localStorage.removeItem(this.CACHE_KEYS.DEVOIRS);
        localStorage.removeItem(this.CACHE_KEYS.DASHBOARD);
        break;
      case 'NOTE_PUBLIEE':
        localStorage.removeItem(this.CACHE_KEYS.DASHBOARD);
        localStorage.removeItem(this.CACHE_KEYS.FORMATIONS);
        // Invalider l'arborescence de toutes les formations (on ne sait pas laquelle)
        this.invalidateModulesCache();
        break;
      case 'COURS_PUBLIE':
        localStorage.removeItem(this.CACHE_KEYS.FORMATIONS);
        this.invalidateModulesCache();
        break;
      case 'CERTIFICAT_EMIS':
        localStorage.removeItem(this.CACHE_KEYS.CERTIFICATS);
        localStorage.removeItem(this.CACHE_KEYS.DASHBOARD);
        localStorage.removeItem(this.CACHE_KEYS.FORMATIONS);
        break;
      default:
        this.invalidateCache();
    }

    // 2. Relayer l'événement aux composants abonnés
    this.liveUpdates$.next(event);

    // 3. Recharger le dashboard en arrière-plan (silencieusement)
    this.getDashboard().subscribe({ error: () => {} });
  }

  /** Invalide uniquement les caches d'arborescence de modules. */
  private invalidateModulesCache(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.CACHE_KEYS.MODULES_PREFIX)) keysToRemove.push(key);
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}
  }

  /**
   * Helper pour lire en toute sécurité depuis le localStorage
   */
  private getLocal<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  /**
   * Helper pour écrire dans le localStorage
   */
  private setLocal<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }

  /**
   * Retourne immédiatement l'instantané du Dashboard en cache (0ms - aucun chargement)
   */
  getDashboardSnapshot(): ApprenantDashboard | null {
    return this.getLocal<ApprenantDashboard>(this.CACHE_KEYS.DASHBOARD);
  }

  /**
   * Retourne immédiatement l'instantané des Formations en cache (0ms)
   */
  getFormationsSnapshot(): ApprenantFormation[] | null {
    return this.getLocal<ApprenantFormation[]>(this.CACHE_KEYS.FORMATIONS);
  }

  /**
   * Retourne immédiatement l'instantané des Modules d'une formation en cache (0ms)
   */
  getFormationModulesSnapshot(formationId: string): FormationArborescence | null {
    return this.getLocal<FormationArborescence>(this.CACHE_KEYS.MODULES_PREFIX + formationId);
  }

  /**
   * Retourne immédiatement l'instantané des Devoirs en cache (0ms)
   */
  getDevoirsSnapshot(): any[] | null {
    return this.getLocal<any[]>(this.CACHE_KEYS.DEVOIRS);
  }

  /**
   * Retourne immédiatement l'instantané des Certificats en cache (0ms)
   */
  getCertificatsSnapshot(): ApprenantCertificat[] | null {
    return this.getLocal<ApprenantCertificat[]>(this.CACHE_KEYS.CERTIFICATS);
  }

  /**
   * Retourne immédiatement l'instantané d'un Quiz en cache local (0ms - transition instantanée)
   */
  getQuizSnapshot(quizId: string): QuizDetail | null {
    return this.getLocal<QuizDetail>(this.CACHE_KEYS.QUIZ_PREFIX + quizId);
  }

  /**
   * Retourne immédiatement l'instantané de la liste des Quiz en cache local (0ms)
   */
  getAllQuizSnapshot(): ApprenantQuizItem[] | null {
    return this.getLocal<ApprenantQuizItem[]>(this.CACHE_KEYS.QUIZ_LIST);
  }

  /**
   * Invalide le cache local pour forcer un rafraîchissement immédiat
   */
  invalidateCache() {
    try {
      localStorage.removeItem(this.CACHE_KEYS.DASHBOARD);
      localStorage.removeItem(this.CACHE_KEYS.FORMATIONS);
      localStorage.removeItem(this.CACHE_KEYS.CERTIFICATS);
      localStorage.removeItem(this.CACHE_KEYS.DEVOIRS);
      localStorage.removeItem(this.CACHE_KEYS.QUIZ_LIST);
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith(this.CACHE_KEYS.MODULES_PREFIX) || key.startsWith(this.CACHE_KEYS.QUIZ_PREFIX))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}
  }

  getDashboard(): Observable<ApprenantDashboard> {
    return this.http.get<ApprenantDashboard>(`${this.apiUrl}/dashboard`).pipe(
      tap((data) => this.setLocal(this.CACHE_KEYS.DASHBOARD, data)),
      shareReplay(1),
    );
  }

  getFormations(): Observable<ApprenantFormation[]> {
    return this.http.get<ApprenantFormation[]>(`${this.apiUrl}/formations`).pipe(
      tap((data) => this.setLocal(this.CACHE_KEYS.FORMATIONS, data)),
      shareReplay(1),
    );
  }

  getFormationModules(formationId: string): Observable<FormationArborescence> {
    return this.http.get<FormationArborescence>(`${this.apiUrl}/formations/${formationId}/modules`).pipe(
      tap((data) => this.setLocal(this.CACHE_KEYS.MODULES_PREFIX + formationId, data)),
      shareReplay(1),
    );
  }

  getEligibiliteCertificat(formationId: string): Observable<EligibiliteCertificat> {
    return this.http.get<EligibiliteCertificat>(`${this.apiUrl}/formations/${formationId}/eligibilite-certificat`).pipe(
      map((res) => ({
        ...res,
        certificat: res.certificat
          ? {
              ...res.certificat,
              urlPdfS3: this.resolveFileUrl(res.certificat.urlPdfS3),
            }
          : null,
      })),
      shareReplay(1),
    );
  }

  getCoursContenu(coursId: string): Observable<CoursContenu> {
    return this.http.get<CoursContenu>(`${this.apiUrl}/cours/${coursId}/contenu`).pipe(
      map((c) => ({
        ...c,
        fileUrl: c.fileUrl ? this.resolveFileUrl(c.fileUrl) : null,
      }))
    );
  }

  markCoursProgression(coursId: string): Observable<any> {
    this.invalidateCache();
    return this.http.post<any>(`${this.apiUrl}/cours/${coursId}/progression`, {});
  }

  getQuiz(quizId: string): Observable<QuizDetail> {
    return this.http.get<QuizDetail>(`${this.apiUrl}/quiz/${quizId}`).pipe(
      tap((data) => this.setLocal(this.CACHE_KEYS.QUIZ_PREFIX + quizId, data)),
      shareReplay(1),
    );
  }

  submitQuiz(quizId: string, reponses: { questionId: string; selectedIndex: number }[]): Observable<QuizSubmissionResult> {
    this.invalidateCache();
    try {
      localStorage.removeItem(this.CACHE_KEYS.QUIZ_PREFIX + quizId);
      localStorage.removeItem(this.CACHE_KEYS.QUIZ_LIST);
    } catch {}
    return this.http.post<QuizSubmissionResult>(`${this.apiUrl}/quiz/${quizId}/soumettre`, { reponses });
  }

  deposerDevoir(devoirId: string, file: File): Observable<any> {
    this.invalidateCache();
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/devoirs/${devoirId}/deposer`, formData);
  }

  /**
   * Récupère tous les devoirs en UNE SEULE requête (endpoint agrégé backend)
   */
  getAllDevoirs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/devoirs`).pipe(
      tap((data) => this.setLocal(this.CACHE_KEYS.DEVOIRS, data)),
      shareReplay(1),
    );
  }

  /**
   * Récupère tous les quiz de l'apprenant en UNE SEULE requête (endpoint agrégé backend)
   */
  getAllQuiz(): Observable<ApprenantQuizItem[]> {
    return this.http.get<ApprenantQuizItem[]>(`${this.apiUrl}/quiz`).pipe(
      tap((data) => this.setLocal(this.CACHE_KEYS.QUIZ_LIST, data)),
      shareReplay(1),
    );
  }

  /**
   * Résout les URLs de fichiers locaux (/uploads/...) vers le backend NestJS.
   * En mode local, les fichiers sont servis par NestJS, pas Angular.
   */
  private resolveFileUrl(url: string): string {
    if (url && url.startsWith('/uploads/')) {
      // Mode stockage local : préfixer avec l'URL de base du backend
      const backendBase = environment.apiUrl.replace('/api', '');
      return `${backendBase}${url}`;
    }
    return url; // URL S3 absolue : inchangée
  }

  getCertificats(): Observable<ApprenantCertificat[]> {
    return this.http.get<ApprenantCertificat[]>(`${this.apiUrl}/certificats`).pipe(
      map((data) =>
        data.map((c) => ({
          ...c,
          urlPdfS3: this.resolveFileUrl(c.urlPdfS3),
        }))
      ),
      tap((data) => this.setLocal(this.CACHE_KEYS.CERTIFICATS, data)),
      shareReplay(1),
    );
  }

  telechargerCertificat(certificatId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/certificats/${certificatId}/telecharger`, {
      responseType: 'blob',
    });
  }
}
