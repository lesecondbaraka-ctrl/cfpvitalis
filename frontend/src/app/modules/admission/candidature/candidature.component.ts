import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AdmissionService, Candidature, SessionAdmission, PieceCandidature } from '../../../core/services/admission.service';
import { NotificationsService } from '../../../core/services/notifications.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-candidature',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <main class="min-h-screen bg-[#F5F6F7] px-4 py-8 sm:px-8 font-sans">
      <div class="mx-auto max-w-6xl">
        <!-- En-tête -->
        <div class="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between bg-white p-6 rounded border border-[#D7DBDE] shadow-xs">
          <div>
            <a routerLink="/apprenant/dashboard" class="inline-flex items-center gap-1 text-xs font-semibold text-[#1C75BC] hover:underline">
              ← Retour à mon tableau de bord
            </a>
            <h1 class="mt-2 text-2xl font-bold text-[#1B1D1F] font-heading">Mes Candidatures & Suivi des Dossiers</h1>
            <p class="mt-1 text-xs sm:text-sm text-[#4B5157]">
              Consultez les sessions ouvertes, déposez vos pièces justificatives, et accédez aux explications officielles et décisions des dirigeants.
            </p>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <span class="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
              <span class="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Synchronisé en direct
            </span>
            <span class="text-xs font-bold text-[#4B5157] bg-gray-100 px-2.5 py-1 rounded">
              {{ voeux.length }} vœu{{ voeux.length === 1 ? '' : 'x' }}
            </span>
          </div>
        </div>

        <!-- Alertes erreurs -->
        <div *ngIf="error" class="mb-6 rounded border border-[#C94C4C] bg-white p-4 text-xs sm:text-sm text-[#9E3030] shadow-sm flex items-center justify-between">
          <span>{{ error }}</span>
          <button (click)="error = ''" class="text-xs text-gray-400 hover:text-gray-700 font-bold">✕</button>
        </div>

        <section class="grid gap-8 lg:grid-cols-[1.15fr_1.35fr]">
          <!-- Colonne gauche : Sessions ouvertes -->
          <div>
            <div class="mb-3 flex items-center justify-between">
              <h2 class="text-base font-bold text-[#1B1D1F]">Sessions de formation disponibles</h2>
              <div class="flex items-center gap-2">
                <span *ngIf="syncing" class="inline-flex items-center gap-1 text-xs text-[#1C75BC]">
                  <span class="inline-block h-2.5 w-2.5 animate-spin rounded-full border border-[#1C75BC] border-t-transparent"></span>
                  Actualisation...
                </span>
                <span class="text-xs text-[#4B5157]">{{ sessions.length }} session{{ sessions.length === 1 ? '' : 's' }}</span>
              </div>
            </div>

            <!-- Chargement initial -->
            <div *ngIf="loading && sessions.length === 0" class="space-y-3">
              <div *ngFor="let item of [1,2]" class="rounded border border-[#D7DBDE] bg-white p-5 shadow-sm animate-pulse">
                <div class="h-4 w-1/3 bg-gray-200 rounded mb-2"></div>
                <div class="h-3 w-1/2 bg-gray-200 rounded mb-2"></div>
                <div class="h-3 w-1/4 bg-gray-100 rounded"></div>
              </div>
            </div>

            <!-- Aucune session disponible -->
            <div *ngIf="!loading && sessions.length === 0" class="rounded border border-[#D7DBDE] bg-white p-8 text-center text-sm text-[#4B5157] shadow-sm">
              <p class="font-medium">Aucune session d'admission n'est actuellement ouverte.</p>
              <p class="mt-1 text-xs text-[#71787E]">Les prochaines campagnes d'admission seront affichées dès leur ouverture.</p>
            </div>

            <!-- Liste des sessions -->
            <div *ngIf="sessions.length > 0" class="space-y-3">
              <article *ngFor="let session of sessions" class="rounded border border-[#D7DBDE] bg-white p-5 shadow-sm transition hover:shadow-md">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 class="font-bold text-[#1B1D1F] text-sm">{{ session.libelle }}</h3>
                    <p class="mt-1 text-xs sm:text-sm text-[#4B5157]">
                      <span class="font-semibold text-[#1C75BC]">{{ session.filiere.libelle }}</span> · {{ session.niveau.libelle }}
                    </p>
                    <p class="mt-1 text-xs text-[#71787E]">
                      Établissement : {{ session.etablissement.nom }} ({{ session.etablissement.codeAntenne }})
                    </p>
                    <p class="mt-0.5 text-xs text-[#71787E]">
                      Clôture le {{ session.dateFermeture | date:'dd/MM/yyyy' }} · Capacité : {{ session.capacite }} places
                    </p>
                  </div>
                  <button type="button" class="btn btn-primary text-xs shrink-0 py-2 px-3.5 bg-[#1C75BC] text-white font-semibold cursor-pointer"
                          [disabled]="isApplied(session.id) || submitting === session.id"
                          (click)="apply(session)">
                    {{ isApplied(session.id) ? '✓ Vœu déposé' : (submitting === session.id ? 'Ajout...' : '+ Déposer un vœu') }}
                  </button>
                </div>
              </article>
            </div>
          </div>

          <!-- Colonne droite : Suivi des vœux, explications et pièces -->
          <div>
            <div class="mb-3 flex items-center justify-between">
              <h2 class="text-base font-bold text-[#1B1D1F]">Mes Vœux & Décisions des Dirigeants</h2>
              <button (click)="loadVoeux(true)" class="text-xs text-[#1C75BC] hover:underline cursor-pointer" [disabled]="refreshing">
                {{ refreshing ? 'Actualisation...' : '🔄 Actualiser' }}
              </button>
            </div>

            <!-- Aucun vœu -->
            <div *ngIf="voeux.length === 0" class="rounded border border-[#D7DBDE] bg-white p-8 text-center text-sm text-[#4B5157] shadow-sm">
              <p class="font-medium">Vous n'avez pas encore de vœu d'admission déposé.</p>
              <p class="mt-1 text-xs text-[#71787E]">Sélectionnez une session ouverte à gauche pour commencer votre dossier d'adhésion.</p>
            </div>

            <!-- Liste des vœux -->
            <div *ngIf="voeux.length > 0" class="space-y-4">
              <article *ngFor="let voeu of voeux" class="rounded-lg border border-[#D7DBDE] bg-white p-5 shadow-sm space-y-3">
                <!-- Titre & Statut -->
                <div class="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                  <div>
                    <h3 class="text-sm font-bold text-[#1B1D1F]">{{ voeu.session.libelle }}</h3>
                    <div class="text-xs text-[#71787E]">{{ voeu.session.filiere.libelle }} · {{ voeu.session.niveau.libelle }} · {{ voeu.session.etablissement.nom }}</div>
                  </div>
                  <span class="rounded px-2.5 py-1 text-xs font-bold shrink-0"
                        [ngClass]="{
                          'bg-amber-100 text-amber-800': voeu.statut === 'BROUILLON',
                          'bg-blue-100 text-blue-800': voeu.statut === 'SOUMISE' || voeu.statut === 'EN_EVALUATION',
                          'bg-emerald-100 text-emerald-800': voeu.statut === 'ADMISE' || voeu.statut === 'CONFIRMEE' || voeu.statut === 'INSCRITE',
                          'bg-purple-100 text-purple-800': voeu.statut === 'LISTE_ATTENTE',
                          'bg-rose-100 text-rose-800': voeu.statut === 'REJETEE' || voeu.statut === 'EXPIREE',
                          'bg-gray-100 text-gray-800': voeu.statut === 'RETIREE'
                        }">
                    {{ voeu.statut }}
                  </span>
                </div>

                <!-- ========================================================================= -->
                <!-- SECTION DROIT AUX EXPLICATIONS & AVIS OFFICIEL DES DIRIGEANTS              -->
                <!-- ========================================================================= -->
                <div *ngIf="voeu.commentaireGestionnaire || voeu.scoreEvaluation || voeu.dateDecision || voeu.motifRejet || voeu.statut === 'ADMISE' || voeu.statut === 'LISTE_ATTENTE' || voeu.statut === 'REJETEE'"
                     class="p-4 rounded-lg border text-xs"
                     [ngClass]="{
                       'bg-emerald-50/90 border-emerald-300 text-emerald-950': voeu.statut === 'ADMISE' || voeu.statut === 'CONFIRMEE' || voeu.statut === 'INSCRITE',
                       'bg-purple-50/90 border-purple-300 text-purple-950': voeu.statut === 'LISTE_ATTENTE',
                       'bg-rose-50/90 border-rose-300 text-rose-950': voeu.statut === 'REJETEE',
                       'bg-blue-50/90 border-blue-300 text-blue-950': voeu.statut === 'EN_EVALUATION' || voeu.statut === 'SOUMISE'
                     }">
                  
                  <div class="flex items-center justify-between font-bold mb-2">
                    <span class="flex items-center gap-1.5 text-xs">
                      <span>🏛️</span>
                      <span>Avis & Explications Officielles des Dirigeants</span>
                    </span>
                    <span *ngIf="voeu.scoreEvaluation" class="px-2 py-0.5 rounded bg-white font-bold text-xs shadow-2xs border border-gray-300 text-gray-800">
                      Note attribuée : {{ voeu.scoreEvaluation }}/20
                    </span>
                  </div>

                  <!-- Commentaires & explications -->
                  <div *ngIf="voeu.commentaireGestionnaire" class="p-3 bg-white rounded border border-gray-200/80 shadow-2xs leading-relaxed">
                    <span class="font-bold block text-[11px] text-gray-500 uppercase tracking-wider mb-1">
                      Retour & Évaluation de la Direction :
                    </span>
                    <p class="text-gray-900 font-medium text-xs whitespace-pre-line italic">
                      « {{ voeu.commentaireGestionnaire }} »
                    </p>
                  </div>

                  <!-- Motif de rejet si applicable -->
                  <div *ngIf="voeu.motifRejet" class="mt-2 p-2 bg-white/90 rounded border border-rose-200 text-rose-900 font-semibold">
                    ❌ <strong>Motif de la décision :</strong> {{ voeu.motifRejet }}
                  </div>

                  <!-- Message de félicitations pour admis -->
                  <div *ngIf="voeu.statut === 'ADMISE'" class="mt-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2.5 bg-emerald-100/90 rounded border border-emerald-300 text-emerald-900">
                    <div>
                      <strong>🎉 Candidature retenue !</strong> Félicitations, vous êtes admis à cette formation.
                    </div>
                    <span *ngIf="voeu.dateExpiration" class="text-xs font-bold text-emerald-950 bg-white px-2 py-1 rounded shadow-2xs">
                      Confirmation avant le : {{ voeu.dateExpiration | date:'dd/MM/yyyy' }}
                    </span>
                  </div>

                  <!-- Message de liste d'attente -->
                  <div *ngIf="voeu.statut === 'LISTE_ATTENTE'" class="mt-2 p-2 bg-purple-100 rounded border border-purple-300 text-purple-900 font-medium">
                    ⏳ Vous êtes positionné au <strong>rang #{{ voeu.rangListeAttente }}</strong> de la liste d'attente. Votre dossier sera automatiquement promu en cas de libération d'une place.
                  </div>

                  <!-- Date de formalisation de la décision -->
                  <div *ngIf="voeu.dateDecision" class="mt-2 text-[10px] text-gray-500 font-medium">
                    Décision de la direction enregistrée le {{ voeu.dateDecision | date:'dd/MM/yyyy à HH:mm' }}
                  </div>
                </div>

                <!-- Alertes supplémentaires -->
                <div *ngIf="voeu.conflitCalendrier" class="text-xs font-medium text-amber-700 bg-amber-50 rounded p-2.5 border border-amber-200">
                  ⚠️ Inscription active en parallèle : votre dossier est géré en régime de mise en réserve.
                </div>

                <!-- SECTION PIECES DU DOSSIER -->
                <div class="rounded-lg bg-gray-50 p-3.5 border border-gray-200 space-y-2.5">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-[#1B1D1F] flex items-center gap-1.5">
                      📁 Documents & Pièces Justificatives
                    </span>
                    <span class="text-[11px] font-semibold"
                          [ngClass]="(voeu.pieces?.length || 0) > 0 ? 'text-emerald-700' : 'text-amber-700'">
                      {{ (voeu.pieces?.length || 0) > 0 ? '✓ ' + voeu.pieces?.length + ' pièce(s) jointe(s)' : '⚠️ 0 pièce jointe (Requis)' }}
                    </span>
                  </div>

                  <!-- Formulaire d'ajout de pièce si statut BROUILLON -->
                  <div *ngIf="voeu.statut === 'BROUILLON'" class="p-3 bg-white rounded border border-gray-200 text-xs space-y-2">
                    <div class="font-medium text-[#1B1D1F]">Ajouter une pièce justificative :</div>
                    <div class="flex flex-wrap items-center gap-2">
                      <select [(ngModel)]="selectedPieceTypes[voeu.id]" class="rounded border border-gray-300 px-2.5 py-1.5 text-xs bg-white text-[#1B1D1F]">
                        <option value="PIECE_IDENTITE">🪪 Pièce d'identité (CNI / Passeport)</option>
                        <option value="DIPLOME">🎓 Diplôme ou Attestation</option>
                        <option value="RELEVE_NOTES">📊 Relevé de notes</option>
                        <option value="CV">📄 Curriculum Vitae (CV)</option>
                        <option value="LETTRE_MOTIVATION">✉️ Lettre de motivation</option>
                        <option value="AUTRE">📎 Autre justificatif</option>
                      </select>

                      <label class="inline-flex items-center gap-1 cursor-pointer rounded bg-[#1C75BC] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#165c94] transition shadow-xs">
                        <span>📤 Choisir un fichier (PDF, JPG, PNG)</span>
                        <input type="file" class="hidden" (change)="upload(voeu, $event)" accept=".pdf,.jpg,.jpeg,.png" [disabled]="busy === voeu.id" />
                      </label>
                    </div>
                  </div>

                  <!-- Liste des pièces téléversées -->
                  <div *ngIf="voeu.pieces && voeu.pieces.length > 0" class="space-y-1.5">
                    <div *ngFor="let piece of voeu.pieces" class="flex items-center justify-between bg-white px-3 py-2 rounded border border-gray-200 text-xs">
                      <div class="flex items-center gap-2 overflow-hidden">
                        <span class="text-sm">📄</span>
                        <span class="font-medium text-[#1B1D1F] truncate text-xs">{{ piece.nomFichier }}</span>
                        <span class="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-700 font-semibold shrink-0 border border-blue-100">
                          {{ formatPieceType(piece.type) }}
                        </span>
                      </div>

                      <div class="flex items-center gap-1.5 shrink-0 ml-2">
                        <button type="button" *ngIf="piece.fileUrl" (click)="viewPiece(piece)"
                                class="text-[#1C75BC] hover:underline font-semibold text-xs px-2 py-1 bg-blue-50/80 rounded border border-blue-200 cursor-pointer">
                          👁️ Voir
                        </button>
                        <button type="button" *ngIf="piece.fileUrl" (click)="downloadPiece(piece)"
                                [disabled]="downloadingPieceId === (piece.id || piece.nomFichier)"
                                class="text-gray-700 hover:bg-gray-100 font-semibold text-xs px-2 py-1 bg-gray-50 rounded border border-gray-200 cursor-pointer">
                          {{ downloadingPieceId === (piece.id || piece.nomFichier) ? '⏳ ...' : '⬇️ Télécharger' }}
                        </button>
                        <button *ngIf="voeu.statut === 'BROUILLON'"
                                type="button"
                                class="text-rose-600 hover:text-rose-800 text-xs font-medium px-1.5 py-1 cursor-pointer"
                                [disabled]="busy === voeu.id"
                                (click)="deletePiece(voeu, piece.id)">
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Message si aucune pièce -->
                  <div *ngIf="!voeu.pieces || voeu.pieces.length === 0" class="text-center py-2 text-xs text-[#71787E]">
                    Aucune pièce justificative déposée. Joignez vos documents requis avant de soumettre.
                  </div>
                </div>

                <!-- ACTIONS DU VOEU -->
                <div class="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
                  <div class="flex flex-wrap items-center gap-2">
                    <!-- Bouton Soumettre : Débloqué uniquement si pièces présentes -->
                    <button *ngIf="voeu.statut === 'BROUILLON'"
                            type="button"
                            class="text-xs font-semibold px-4 py-2 rounded transition shadow-sm cursor-pointer"
                            [ngClass]="(voeu.pieces?.length || 0) > 0 ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
                            [disabled]="busy === voeu.id || !voeu.pieces || voeu.pieces.length === 0"
                            (click)="submit(voeu)">
                      {{ busy === voeu.id ? 'Soumission...' : ((voeu.pieces?.length || 0) > 0 ? '🚀 Soumettre mon dossier complet' : '🔒 Joindre une pièce pour soumettre') }}
                    </button>

                    <!-- Bouton Confirmer si ADMISE -->
                    <button *ngIf="voeu.statut === 'ADMISE'"
                            type="button"
                            class="btn btn-primary text-xs font-bold py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
                            [disabled]="busy === voeu.id"
                            (click)="confirm(voeu)">
                      {{ busy === voeu.id ? 'Confirmation...' : '✅ Confirmer ma place définitive' }}
                    </button>
                  </div>

                  <!-- Bouton Retirer -->
                  <button *ngIf="['BROUILLON','SOUMISE','EN_EVALUATION','ADMISE','LISTE_ATTENTE'].includes(voeu.statut)"
                          type="button"
                          class="btn btn-ghost text-xs text-[#9E3030] hover:bg-rose-50 cursor-pointer"
                          [disabled]="busy === voeu.id"
                          (click)="withdraw(voeu)">
                    Retirer ce vœu
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>
      </div>
    </main>
  `,
})
export class CandidatureComponent implements OnInit, OnDestroy {
  sessions: SessionAdmission[] = [];
  voeux: Candidature[] = [];
  selectedPieceTypes: Record<string, string> = {};
  loading = true;
  syncing = false;
  refreshing = false;
  error = '';
  submitting = '';
  busy = '';
  private sub: Subscription | null = null;

  constructor(
    private admission: AdmissionService,
    private notifications: NotificationsService,
    private toast: ToastService,
  ) {
    const cachedSessions = this.admission.getSessionsPubliquesSnapshot();
    if (cachedSessions && cachedSessions.length > 0) {
      this.sessions = cachedSessions;
      this.loading = false;
    }

    const cachedVoeux = this.admission.getMesVoeuxSnapshot();
    if (cachedVoeux) {
      this.voeux = cachedVoeux;
    }
  }

  ngOnInit(): void {
    this.loadSessions();
    this.loadVoeux(false);

    setTimeout(() => {
      this.loading = false;
    }, 2000);

    // Abonnement temps réel SSE
    this.sub = this.notifications.messages().subscribe({
      next: (msg) => {
        if (msg && typeof msg === 'object' && (msg.type === 'ADMISSION_STATUS_CHANGE' || msg.type === 'ADMISSION_CONFIRMED' || msg.type === 'ADMISSION_INSCRIBED')) {
          this.loadVoeux(false);
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadSessions(): void {
    this.syncing = true;
    this.admission.getSessionsPubliques().subscribe({
      next: (sessions) => {
        this.sessions = sessions || [];
        this.loading = false;
        this.syncing = false;
      },
      error: () => {
        this.loading = false;
        this.syncing = false;
      },
    });
  }

  loadVoeux(manual = false): void {
    if (manual) this.refreshing = true;
    this.admission.getMesVoeux().subscribe({
      next: (voeux) => {
        this.voeux = voeux || [];
        this.voeux.forEach((v) => {
          if (!this.selectedPieceTypes[v.id]) {
            this.selectedPieceTypes[v.id] = 'PIECE_IDENTITE';
          }
        });
        this.refreshing = false;
      },
      error: () => {
        this.refreshing = false;
      },
    });
  }

  isApplied(sessionId: string): boolean {
    return this.voeux.some((voeu) => voeu.session.id === sessionId && voeu.statut !== 'RETIREE' && voeu.statut !== 'REJETEE' && voeu.statut !== 'EXPIREE');
  }

  apply(session: SessionAdmission): void {
    this.submitting = session.id;
    this.error = '';
    this.admission.createCandidature(session.id).subscribe({
      next: (voeu) => {
        this.voeux = [voeu, ...this.voeux];
        this.selectedPieceTypes[voeu.id] = 'PIECE_IDENTITE';
        this.submitting = '';
        this.toast.success('Vœu ajouté avec succès en brouillon. Veuillez joindre vos pièces justificatives.');
      },
      error: (error) => {
        this.error = error.error?.message || 'Impossible d’ajouter ce vœu.';
        this.toast.error(this.error);
        this.submitting = '';
      },
    });
  }

  upload(voeu: Candidature, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const pieceType = this.selectedPieceTypes[voeu.id] || 'PIECE_IDENTITE';
    this.busy = voeu.id;
    this.admission.uploadPiece(voeu.id, pieceType, file).subscribe({
      next: (piece) => {
        voeu.pieces = [...(voeu.pieces || []), piece];
        this.busy = '';
        this.toast.success(`Pièce "${piece.nomFichier}" déposée avec succès.`);
        (event.target as HTMLInputElement).value = '';
      },
      error: (error) => {
        this.error = error.error?.message || 'Impossible de déposer la pièce.';
        this.toast.error(this.error);
        this.busy = '';
        (event.target as HTMLInputElement).value = '';
      },
    });
  }

  deletePiece(voeu: Candidature, pieceId: string): void {
    this.busy = voeu.id;
    this.admission.deletePiece(voeu.id, pieceId).subscribe({
      next: () => {
        voeu.pieces = (voeu.pieces || []).filter((p) => p.id !== pieceId);
        this.busy = '';
        this.toast.info('Pièce supprimée du dossier.');
      },
      error: (error) => {
        this.error = error.error?.message || 'Impossible de supprimer la pièce.';
        this.toast.error(this.error);
        this.busy = '';
      },
    });
  }

  submit(voeu: Candidature): void {
    if (!voeu.pieces || voeu.pieces.length === 0) {
      this.toast.error('Veuillez joindre au moins une pièce justificative avant de soumettre.');
      return;
    }
    this.busy = voeu.id;
    this.admission.submitCandidature(voeu.id).subscribe({
      next: (updated) => {
        this.voeux = this.voeux.map((item) => item.id === updated.id ? { ...item, ...updated } : item);
        this.busy = '';
        this.toast.success('Dossier de candidature complet soumis pour évaluation.');
      },
      error: (error) => {
        this.error = error.error?.message || 'Impossible de soumettre le dossier.';
        this.toast.error(this.error);
        this.busy = '';
      },
    });
  }

  confirm(voeu: Candidature): void {
    this.busy = voeu.id;
    this.admission.confirmCandidature(voeu.id).subscribe({
      next: (updated) => {
        this.voeux = this.voeux.map((item) => {
          if (item.id === updated.id) return { ...item, ...updated };
          if (['BROUILLON', 'SOUMISE', 'EN_EVALUATION', 'ADMISE', 'LISTE_ATTENTE'].includes(item.statut)) {
            return { ...item, statut: 'RETIREE' };
          }
          return item;
        });
        this.busy = '';
        this.toast.success('Admission confirmée ! Vos autres vœux ont été automatiquement retirés.');
      },
      error: (error) => {
        this.error = error.error?.message || 'Impossible de confirmer l’admission.';
        this.toast.error(this.error);
        this.busy = '';
      },
    });
  }

  withdraw(voeu: Candidature): void {
    this.busy = voeu.id;
    this.admission.withdrawCandidature(voeu.id).subscribe({
      next: (updated) => {
        this.voeux = this.voeux.map((item) => item.id === updated.id ? { ...item, ...updated } : item);
        this.busy = '';
        this.toast.info('Vœu retiré.');
      },
      error: (error) => {
        this.error = error.error?.message || 'Impossible de retirer le vœu.';
        this.toast.error(this.error);
        this.busy = '';
      },
    });
  }

  downloadingPieceId: string | null = null;

  viewPiece(piece: { fileUrl?: string; nomFichier?: string }): void {
    if (!piece.fileUrl) {
      this.toast.error('Document non disponible.');
      return;
    }
    const url = this.getPieceUrl(piece.fileUrl);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  downloadPiece(piece: { fileUrl?: string; nomFichier?: string; id?: string }): void {
    if (!piece.fileUrl) {
      this.toast.error('Document non disponible.');
      return;
    }
    const pieceKey = piece.id || piece.nomFichier || piece.fileUrl;
    this.downloadingPieceId = pieceKey;
    this.admission.downloadFile(piece.fileUrl).subscribe({
      next: (blob) => {
        this.admission.saveBlob(blob, piece.nomFichier || 'document');
        this.downloadingPieceId = null;
        this.toast.success(`Téléchargement de « ${piece.nomFichier || 'document'} » terminé.`);
      },
      error: () => {
        this.downloadingPieceId = null;
        const fullUrl = this.getPieceUrl(piece.fileUrl);
        const a = document.createElement('a');
        a.href = fullUrl;
        a.download = piece.nomFichier || 'document';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
    });
  }

  getPieceUrl(fileUrl?: string): string {
    return this.admission.getPieceUrl(fileUrl);
  }

  formatPieceType(type: string): string {
    switch (type) {
      case 'PIECE_IDENTITE': return 'Pièce d\'identité';
      case 'DIPLOME': return 'Diplôme';
      case 'RELEVE_NOTES': return 'Relevé de notes';
      case 'PHOTO': return 'Photo';
      case 'CV': return 'CV';
      case 'LETTRE_MOTIVATION': return 'Lettre de motivation';
      default: return 'Autre';
    }
  }
}
