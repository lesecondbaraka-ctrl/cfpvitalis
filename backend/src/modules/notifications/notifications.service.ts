import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export type NotificationEventType =
  // ─── Module Apprenant ───────────────────────────────────────────────────────
  | 'DEVOIR_NOTE'
  | 'NOTE_PUBLIEE'
  | 'COURS_PUBLIE'
  | 'CERTIFICAT_EMIS'
  // ─── Module Admission ───────────────────────────────────────────────────────
  | 'ADMISSION_NEW_CANDIDATURE'
  | 'ADMISSION_CONFIRMED'
  | 'ADMISSION_INSCRIBED'
  | 'ADMISSION_STATUS_CHANGE'
  // ─── Module Landing / Actualités ────────────────────────────────────────────
  | 'ACTUALITE_UPDATE'
  | 'DEMANDE_ORIENTATION'
  // ─── Auth / Utilisateurs ────────────────────────────────────────────────────
  | 'auth'
  // ─── Générique ───────────────────────────────────────────────────────────────
  | 'BROADCAST';

export interface NotificationPayload {
  type: NotificationEventType;
  /** ID de l'utilisateur destinataire ciblé (ex: l'apprenant concerné). */
  recipientUserId?: string;
  /** Si défini, l'événement est diffusé à tous les utilisateurs de cet établissement. */
  recipientEtablissementId?: string;
  title?: string;
  message?: string;
  data?: Record<string, any>;
  timestamp: string;
  /** Champs legacy admis pour rétrocompatibilité avec les anciens services. */
  [key: string]: any;
}

@Injectable()
export class NotificationsService {
  private subject = new Subject<NotificationPayload>();

  /**
   * Émet un événement structuré vers le flux SSE global.
   */
  emit(payload: Omit<NotificationPayload, 'timestamp'>): void {
    this.subject.next({ ...payload, timestamp: new Date().toISOString() } as NotificationPayload);
  }

  /**
   * Retourne un Observable filtré pour un utilisateur précis.
   * - Correspond si recipientUserId = userId (événement ciblé)
   * - Ou si recipientEtablissementId = etablissementId (broadcast établissement)
   * - Ou si le type est 'BROADCAST' sans restriction
   */
  streamForUser(user: { id: string; etablissementId: string }): Observable<NotificationPayload> {
    return this.subject.asObservable().pipe(
      filter((payload) => {
        if (payload.type === 'BROADCAST') return true;
        if (payload.recipientUserId && payload.recipientUserId === user.id) return true;
        if (payload.recipientEtablissementId && payload.recipientEtablissementId === user.etablissementId) return true;
        return false;
      }),
    );
  }

  /** @deprecated Utiliser streamForUser() pour les appels authentifiés. */
  stream(): Observable<NotificationPayload> {
    return this.subject.asObservable();
  }
}
