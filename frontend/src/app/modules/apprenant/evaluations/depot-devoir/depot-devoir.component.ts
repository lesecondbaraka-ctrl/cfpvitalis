import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApprenantService, ApprenantFormation } from '../../../../core/services/apprenant.service';
import { DevoirsService } from '../../../../core/services/devoirs.service';
import { ToastService } from '../../../../core/services/toast.service';

interface DevoirItem {
  id: string;
  titre: string;
  consignes: string | null;
  dateLimite: string | null;
  moduleTitre: string;
  formationTitre: string;
  soumission: {
    id: string;
    fileUrl: string;
    note: number | null;
    commentaire: string | null;
    dateDepot: string;
  } | null;
}

@Component({
  selector: 'app-depot-devoir',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-fade-in pb-12">
      <!-- HEADER -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-[#1B1D1F] font-heading">Devoirs & Évaluations Pratiques</h1>
          <div class="barre"></div>
          <p class="text-xs text-[#4B5157] mt-2">
            Déposez vos travaux pratiques, projets et devoirs à corriger par vos formateurs.
          </p>
        </div>
      </div>

      @if (loading) {
        <div class="p-16 text-center text-[#4B5157] bg-white border border-[#D7DBDE] rounded-xs">
          <div class="inline-block w-8 h-8 border-3 border-[#1C75BC] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p class="text-xs font-semibold text-[#4B5157]">Chargement de vos devoirs...</p>
        </div>
      } @else if (devoirs.length === 0) {
        <div class="p-12 text-center bg-white border border-[#D7DBDE] rounded-xs text-[#4B5157] space-y-3">
          <svg class="w-12 h-12 text-[#9AA1A8] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="text-sm font-bold text-[#1B1D1F]">Aucun devoir à rendre</h3>
          <p class="text-xs text-[#4B5157]">Vous n'avez aucun travail pratique en attente actuellement.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- LEFT: DEVOIR LIST (1 col) -->
          <div class="space-y-3">
            <h2 class="text-xs font-bold text-[#4B5157] uppercase tracking-wider">
              Mes Devoirs ({{ devoirs.length }})
            </h2>

            <div class="space-y-2.5">
              @for (d of devoirs; track d.id) {
                <div
                  (click)="selectDevoir(d)"
                  class="p-4 border cursor-pointer transition-all rounded-xs shadow-2xs"
                  [class]="selectedDevoir?.id === d.id ? 'bg-[#E7F1FA] border-[#1C75BC] border-l-4 border-l-[#F0791E]' : 'bg-white border-[#D7DBDE] hover:bg-[#F5F6F7] hover:border-[#1C75BC]'"
                >
                  <div class="flex items-center justify-between gap-2">
                    <span class="px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider" [class]="d.soumission?.note !== null && d.soumission?.note !== undefined ? 'bg-[#E7F1EA] text-[#276B44] border border-[#276B44]' : d.soumission ? 'bg-[#E7F1FA] text-[#1C75BC] border border-[#1C75BC]' : isOverdue(d.dateLimite) ? 'bg-[#FDECEA] text-[#ED1C24] border border-[#ED1C24]' : 'bg-[#FDECDD] text-[#F0791E] border border-[#F0791E]'">
                      {{ d.soumission?.note !== null && d.soumission?.note !== undefined ? 'Noté : ' + d.soumission?.note + '/20' : d.soumission ? 'Déposé' : isOverdue(d.dateLimite) ? 'En retard' : 'À rendre' }}
                    </span>
                    <span class="text-[10px] text-[#4B5157] font-mono">
                      {{ d.dateLimite ? (d.dateLimite | date:'dd/MM/yy') : 'Sans limite' }}
                    </span>
                  </div>

                  <h3 class="text-xs font-bold text-[#1B1D1F] mt-2 line-clamp-1">{{ d.titre }}</h3>
                  <p class="text-[11px] text-[#4B5157] mt-0.5 truncate">{{ d.formationTitre }} · {{ d.moduleTitre }}</p>
                </div>
              }
            </div>
          </div>

          <!-- RIGHT: SELECTED DEVOIR DETAIL & DROPZONE (2 cols) -->
          <div class="lg:col-span-2">
            @if (selectedDevoir) {
              <div class="p-6 md:p-8 bg-white border border-[#D7DBDE] rounded-xs space-y-6 animate-fade-in shadow-xs">
                <!-- Header -->
                <div class="border-b border-[#D7DBDE] pb-5 space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="px-2.5 py-0.5 rounded-xs bg-[#E7F1FA] text-[#1C75BC] border border-[#1C75BC] text-[10px] font-bold">
                      {{ selectedDevoir.formationTitre }}
                    </span>
                    <span class="text-[#D7DBDE]">·</span>
                    <span class="text-xs text-[#4B5157] font-semibold">{{ selectedDevoir.moduleTitre }}</span>
                  </div>
                  <h2 class="text-xl font-bold text-[#1B1D1F]">{{ selectedDevoir.titre }}</h2>
                  <p class="text-xs text-[#4B5157]">
                    Date limite de soumission : <strong>{{ selectedDevoir.dateLimite ? (selectedDevoir.dateLimite | date:'dd MMMM yyyy à HH:mm') : 'Illimitée' }}</strong>
                  </p>
                </div>

                <!-- Consignes -->
                <div class="space-y-2">
                  <h4 class="text-xs font-bold text-[#4B5157] uppercase tracking-wider">Consignes de l'évaluation</h4>
                  <div class="p-4 bg-[#F5F6F7] border border-[#D7DBDE] rounded-xs text-xs text-[#1B1D1F] leading-relaxed whitespace-pre-line">
                    {{ selectedDevoir.consignes || 'Veuillez réaliser le travail demandé et soumettre votre fichier ci-dessous.' }}
                  </div>
                </div>

                <!-- Previous Submission Status (if any) -->
                @if (selectedDevoir.soumission) {
                  <div class="p-5 border-l-4 rounded-xs border shadow-2xs" [class]="selectedDevoir.soumission.note !== null ? 'bg-[#E7F1EA] border-l-[#276B44] border-[#D7DBDE]' : 'bg-[#E7F1FA] border-l-[#1C75BC] border-[#D7DBDE]'">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div class="space-y-1">
                        <div class="flex items-center gap-2">
                          @if (selectedDevoir.soumission.note !== null) {
                            <svg class="w-4 h-4 text-[#276B44]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                            <span class="text-xs font-bold text-[#276B44]">Devoir Corrigé et Noté</span>
                          } @else {
                            <svg class="w-4 h-4 text-[#1C75BC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span class="text-xs font-bold text-[#1C75BC]">Devoir Soumis avec Succès</span>
                          }
                        </div>
                        <p class="text-[11px] text-[#4B5157] font-mono">
                          Déposé le {{ selectedDevoir.soumission.dateDepot | date:'dd/MM/yyyy à HH:mm' }}
                        </p>
                        @if (selectedDevoir.soumission.note !== null) {
                          <p class="text-lg font-black text-[#276B44] pt-1 font-mono">
                            Note : {{ selectedDevoir.soumission.note }} / 20
                          </p>
                        }
                        @if (selectedDevoir.soumission.commentaire) {
                          <div class="pt-2 text-xs text-[#1B1D1F] bg-white/60 p-3 rounded-xs border border-[#D7DBDE]">
                            <strong>Remarque du formateur :</strong> {{ selectedDevoir.soumission.commentaire }}
                          </div>
                        }
                      </div>

                      <a
                        [href]="selectedDevoir.soumission.fileUrl"
                        target="_blank"
                        class="px-4 py-2 rounded-xs bg-white border border-[#D7DBDE] text-xs font-bold text-[#1B1D1F] hover:bg-[#F5F6F7] shadow-2xs flex items-center gap-2 whitespace-nowrap self-start sm:self-center"
                      >
                        <svg class="w-3.5 h-3.5 text-[#1C75BC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span>Mon fichier déposé</span>
                      </a>
                    </div>
                  </div>
                }

                <!-- DROPZONE UPLOAD -->
                @if (!selectedDevoir.soumission || selectedDevoir.soumission.note === null) {
                  <div class="space-y-4 pt-2">
                    <h4 class="text-xs font-bold text-[#4B5157] uppercase tracking-wider">
                      {{ selectedDevoir.soumission ? 'Remplacer ma soumission' : 'Déposer mon travail (PDF, DOCX, ZIP)' }}
                    </h4>

                    <div
                      (dragover)="onDragOver($event)"
                      (dragleave)="onDragLeave($event)"
                      (drop)="onDrop($event)"
                      class="border-2 border-dashed p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 rounded-xs"
                      [class]="isDragging ? 'border-[#1C75BC] bg-[#E7F1FA]' : 'border-[#D7DBDE] hover:border-[#1C75BC] bg-[#F5F6F7]'"
                      (click)="fileInput.click()"
                    >
                      <input
                        #fileInput
                        type="file"
                        (change)="onFileSelected($event)"
                        class="hidden"
                        accept=".pdf,.doc,.docx,.zip,.rar,.txt"
                      />

                      <div class="w-12 h-12 rounded-xs bg-[#E7F1FA] text-[#1C75BC] flex items-center justify-center text-2xl border-b-2 border-[#F0791E]">
                        <svg class="w-6 h-6 text-[#1C75BC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>

                      @if (selectedFile) {
                        <div class="text-center">
                          <p class="text-xs font-bold text-[#1B1D1F]">{{ selectedFile.name }}</p>
                          <p class="text-[11px] text-[#4B5157] mt-0.5 font-mono">{{ formatFileSize(selectedFile.size) }}</p>
                        </div>
                      } @else {
                        <div class="text-center">
                          <p class="text-xs font-semibold text-[#1B1D1F]">Glissez-déposez votre document ici, ou <span class="text-[#1C75BC] font-bold">parcourez</span></p>
                          <p class="text-[11px] text-[#4B5157] mt-1">Formats acceptés : PDF, Word (.docx), Archives ZIP (Max 10 Mo)</p>
                        </div>
                      }
                    </div>

                    <div class="flex justify-end">
                      <button
                        (click)="uploadDevoir()"
                        [disabled]="!selectedFile || uploading"
                        class="px-6 py-2.5 rounded-xs bg-[#F0791E] hover:bg-[#d96612] text-white text-xs font-bold shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                      >
                        <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>{{ uploading ? 'Envoi sécurisé S3...' : 'Confirmer le dépôt' }}</span>
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class DepotDevoirComponent implements OnInit {
  devoirs: DevoirItem[] = [];
  selectedDevoir: DevoirItem | null = null;
  loading = true;

  // Upload
  selectedFile: File | null = null;
  isDragging = false;
  uploading = false;

  constructor(
    private route: ActivatedRoute,
    private apprenantService: ApprenantService,
    private devoirsService: DevoirsService,
    private toast: ToastService,
  ) { }

  ngOnInit() {
    const targetDevoirId = this.route.snapshot.queryParamMap.get('devoirId');

    // 1. Rendu instantané depuis le snapshot localStorage (0ms !)
    const cached = this.apprenantService.getDevoirsSnapshot();
    if (cached && cached.length >= 0) {
      this.devoirs = cached as DevoirItem[];
      this.loading = false;
      this.selectInitial(targetDevoirId);
    }

    // 2. Revalidation silencieuse en tâche de fond
    this.loadAllDevoirs(cached === null, targetDevoirId);
  }

  loadAllDevoirs(showSpinner = true, targetDevoirId: string | null = null) {
    if (showSpinner) {
      this.loading = true;
    }

    // UNE SEULE requête SQL agrégée (remplace les anciennes N+1 boucles séquentielles)
    this.apprenantService.getAllDevoirs().subscribe({
      next: (data) => {
        this.devoirs = data as DevoirItem[];
        this.loading = false;
        this.selectInitial(targetDevoirId);
      },
      error: () => {
        this.loading = false;
        this.toast.error('Erreur lors du chargement des devoirs.');
      },
    });
  }

  private selectInitial(targetDevoirId: string | null) {
    if (!this.selectedDevoir) {
      if (targetDevoirId) {
        const match = this.devoirs.find((d) => d.id === targetDevoirId);
        if (match) this.selectDevoir(match);
      } else if (this.devoirs.length > 0) {
        this.selectDevoir(this.devoirs[0]);
      }
    }
  }

  selectDevoir(d: DevoirItem) {
    this.selectedDevoir = d;
    this.selectedFile = null;
  }

  isOverdue(dateLimite: string | null): boolean {
    if (!dateLimite) return false;
    return new Date() > new Date(dateLimite);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
    }
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }

  uploadDevoir() {
    if (!this.selectedDevoir || !this.selectedFile) return;

    this.uploading = true;
    this.apprenantService.deposerDevoir(this.selectedDevoir.id, this.selectedFile).subscribe({
      next: (res) => {
        this.uploading = false;
        this.toast.success('Devoir déposé avec succès !');
        if (this.selectedDevoir) {
          this.selectedDevoir.soumission = {
            id: res.soumissionId,
            fileUrl: res.fileUrl,
            note: null,
            commentaire: null,
            dateDepot: res.dateDepot || new Date().toISOString(),
          };
        }
        this.selectedFile = null;
      },
      error: (err) => {
        this.uploading = false;
        this.toast.error(err.error?.message || 'Erreur lors du dépôt du devoir.');
      },
    });
  }
}
