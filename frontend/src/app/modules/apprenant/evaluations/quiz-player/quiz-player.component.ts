import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ApprenantService,
  QuizDetail,
  QuizSubmissionResult,
} from '../../../../core/services/apprenant.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-quiz-player',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <!-- TOP NAVIGATION -->
      <div class="flex items-center justify-between">
        <a
          routerLink="/apprenant/formations"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-white border border-[#D7DBDE] text-xs font-semibold text-[#1C75BC] hover:bg-[#E7F1FA] transition-all shadow-2xs"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Retour au parcours</span>
        </a>

        @if (quiz && !quiz.tentative && !result && timeLeftSeconds > 0) {
          <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-xs bg-[#124F80] text-white text-xs font-bold font-mono shadow-xs">
            <svg class="w-4 h-4 text-[#F0791E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ formatTime(timeLeftSeconds) }}</span>
          </div>
        }
      </div>

      @if (loading) {
        <div class="p-16 text-center text-[#4B5157] bg-white border border-[#D7DBDE] rounded-xs">
          <div class="inline-block w-8 h-8 border-3 border-[#1C75BC] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p class="text-xs font-semibold text-[#4B5157]">Chargement du quiz d'évaluation...</p>
        </div>
      } @else if (quiz) {
        <!-- QUIZ ALREADY COMPLETED SCREEN -->
        @if (quiz.tentative && !result) {
          <div class="p-8 md:p-12 bg-white border border-[#D7DBDE] rounded-xs text-center space-y-6 shadow-xs">
            <div class="w-14 h-14 rounded-xs bg-[#E7F1FA] text-[#1C75BC] flex items-center justify-center mx-auto border-b-2 border-[#F0791E]">
              <svg class="w-7 h-7 text-[#1C75BC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div class="space-y-2">
              <span class="px-2.5 py-0.5 rounded-xs bg-[#E7F1EA] text-[#276B44] border border-[#276B44] text-xs font-bold uppercase tracking-wider">
                Évaluation Déjà Soumise
              </span>
              <h1 class="text-2xl font-bold text-[#1B1D1F]">{{ quiz.titre }}</h1>
              <p class="text-xs text-[#4B5157]">{{ quiz.formationTitre }}</p>
            </div>

            <div class="p-6 bg-[#F5F6F7] border border-[#D7DBDE] rounded-xs max-w-sm mx-auto shadow-2xs">
              <span class="text-4xl font-black text-[#1C75BC] font-mono">{{ quiz.tentative.score }}%</span>
              <p class="text-xs text-[#4B5157] mt-1 font-mono">Score enregistré le {{ quiz.tentative.datePassage | date:'dd/MM/yyyy à HH:mm' }}</p>
            </div>

            <p class="text-xs text-[#4B5157] max-w-md mx-auto leading-relaxed">
              Conformément au règlement pédagogique ministériel, une seule tentative est autorisée par évaluation. Ce score est comptabilisé dans votre moyenne générale.
            </p>

            <div>
              <a
                routerLink="/apprenant/formations"
                class="px-5 py-2.5 rounded-xs bg-[#1C75BC] text-white text-xs font-bold hover:bg-[#124F80] shadow-xs transition-all inline-flex items-center gap-1.5"
              >
                <span>Continuer mes formations</span>
                <span>→</span>
              </a>
            </div>
          </div>
        } @else if (result) {
          <!-- RESULT SCREEN POST SUBMISSION -->
          <div class="p-8 md:p-12 bg-white border border-[#D7DBDE] rounded-xs space-y-8 animate-fade-in shadow-xs">
            <div class="text-center space-y-3">
              <div class="w-14 h-14 rounded-xs text-3xl flex items-center justify-center mx-auto border-b-2" [class]="result.score >= 50 ? 'bg-[#E7F1EA] text-[#276B44] border-[#276B44]' : 'bg-[#FDECEA] text-[#ED1C24] border-[#ED1C24]'">
                @if (result.score >= 50) {
                  <svg class="w-7 h-7 text-[#276B44]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                } @else {
                  <svg class="w-7 h-7 text-[#ED1C24]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                }
              </div>
              <h1 class="text-2xl font-bold text-[#1B1D1F]">Résultats de votre Quiz</h1>
              <p class="text-xs text-[#4B5157]">Calculé et certifié côté serveur · Vitalis Center EUP</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
              <div class="p-4 bg-[#F5F6F7] border border-[#D7DBDE] rounded-xs text-center shadow-2xs">
                <p class="text-2xl font-black font-mono" [class]="result.score >= 50 ? 'text-[#276B44]' : 'text-[#ED1C24]'">{{ result.score }}%</p>
                <p class="text-[11px] text-[#4B5157] font-semibold mt-0.5">Score global</p>
              </div>
              <div class="p-4 bg-[#F5F6F7] border border-[#D7DBDE] rounded-xs text-center shadow-2xs">
                <p class="text-2xl font-black text-[#1B1D1F] font-mono">{{ result.bonnesReponses }} / {{ result.totalQuestions }}</p>
                <p class="text-[11px] text-[#4B5157] font-semibold mt-0.5">Bonnes réponses</p>
              </div>
              <div class="p-4 bg-[#F5F6F7] border border-[#D7DBDE] rounded-xs text-center shadow-2xs">
                <p class="text-2xl font-black text-[#1C75BC] font-mono">{{ (result.score / 5) | number:'1.1-1' }}/20</p>
                <p class="text-[11px] text-[#4B5157] font-semibold mt-0.5">Note équivalente</p>
              </div>
            </div>

            <!-- Correction Details -->
            <div class="space-y-4 pt-6 border-t border-[#D7DBDE]">
              <div>
                <h3 class="text-sm font-bold text-[#1B1D1F]">Détails des questions traitées</h3>
                <div class="barre"></div>
              </div>
              <div class="space-y-3">
                @for (d of result.detailsCorrection; track d.questionId; let qIdx = $index) {
                  <div class="p-4 border-l-4 rounded-xs border flex items-start gap-3.5 shadow-2xs" [class]="d.estCorrect ? 'bg-[#E7F1EA] border-l-[#276B44] border-[#D7DBDE]' : 'bg-[#FDECEA] border-l-[#ED1C24] border-[#D7DBDE]'">
                    <div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" [class]="d.estCorrect ? 'bg-[#276B44] text-white' : 'bg-[#ED1C24] text-white'">
                      @if (d.estCorrect) {
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      } @else {
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      }
                    </div>
                    <div class="space-y-1">
                      <p class="text-xs font-bold text-[#1B1D1F]">Question {{ qIdx + 1 }}: {{ d.enonce }}</p>
                      <p class="text-[11px] font-semibold" [class]="d.estCorrect ? 'text-[#276B44]' : 'text-[#ED1C24]'">
                        {{ d.estCorrect ? 'Bonne réponse enregistrée' : 'Réponse incorrecte ou non renseignée' }}
                      </p>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="text-center pt-4">
              <a
                routerLink="/apprenant/formations"
                class="px-6 py-3 rounded-xs bg-[#1C75BC] text-white text-xs font-bold hover:bg-[#124F80] shadow-xs transition-all inline-flex items-center gap-1.5"
              >
                <span>Retour aux formations</span>
                <span>→</span>
              </a>
            </div>
          </div>
        } @else {
          <!-- ACTIVE QUIZ PLAYER -->
          <div class="p-4 sm:p-6 md:p-8 bg-white border border-[#D7DBDE] rounded-xs space-y-6 shadow-xs">
            <!-- Quiz Info Header -->
            <div class="border-b border-[#D7DBDE] pb-5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-[#F0791E]">
                    {{ quiz.formationTitre }}
                  </span>
                  <h1 class="text-lg sm:text-xl font-bold text-[#1B1D1F] mt-0.5">{{ quiz.titre }}</h1>
                </div>
                <div class="text-left sm:text-right text-xs text-[#4B5157] font-mono">
                  Question <strong>{{ currentQuestionIndex + 1 }}</strong> sur <strong>{{ quiz.questions.length }}</strong>
                </div>
              </div>

              <!-- Question Navigation Pills -->
              <div class="flex items-center gap-1.5 flex-wrap mt-4">
                @for (q of quiz.questions; track q.id; let idx = $index) {
                  <button
                    (click)="goToQuestion(idx)"
                    class="w-7 h-7 sm:w-8 sm:h-8 rounded-xs text-xs font-bold transition-all border cursor-pointer font-mono"
                    [class]="idx === currentQuestionIndex ? 'bg-[#1C75BC] text-white border-[#1C75BC]' : isAnswered(q.id) ? 'bg-[#E7F1EA] text-[#276B44] border-[#276B44]' : 'bg-[#F5F6F7] text-[#4B5157] border-[#D7DBDE] hover:bg-[#E7F1FA]'"
                  >
                    {{ idx + 1 }}
                  </button>
                }
              </div>
            </div>

            <!-- Current Question -->
            @if (currentQuestion) {
              <div class="space-y-4 sm:space-y-6 py-2">
                <div class="p-4 sm:p-5 bg-[#F5F6F7] border border-[#D7DBDE] rounded-xs">
                  <h3 class="text-xs sm:text-sm font-bold text-[#1B1D1F] leading-relaxed">
                    {{ currentQuestionIndex + 1 }}. {{ currentQuestion.enonce }}
                  </h3>
                </div>

                <!-- Options -->
                <div class="space-y-2.5 sm:space-y-3">
                  @for (opt of currentQuestion.options; track opt.text; let optIdx = $index) {
                    <label
                      (click)="selectOption(currentQuestion.id, optIdx)"
                      class="p-3 sm:p-4 border cursor-pointer flex items-center gap-3 sm:gap-4 transition-all rounded-xs shadow-2xs"
                      [class]="getSelectedOption(currentQuestion.id) === optIdx ? 'bg-[#E7F1FA] border-[#1C75BC] border-l-4 border-l-[#F0791E]' : 'bg-white border-[#D7DBDE] hover:bg-[#F5F6F7] hover:border-[#1C75BC]'"
                    >
                      <input
                        type="radio"
                        [name]="'q_' + currentQuestion.id"
                        [checked]="getSelectedOption(currentQuestion.id) === optIdx"
                        class="w-4 h-4 accent-[#1C75BC] border-[#D7DBDE] shrink-0"
                      />
                      <span class="text-xs font-semibold text-[#1B1D1F] leading-snug">{{ opt.text }}</span>
                    </label>
                  }
                </div>
              </div>
            }

            <!-- Bottom Navigation Actions -->
            <div class="p-3 sm:p-4 bg-[#F5F6F7] border border-[#D7DBDE] rounded-xs flex items-center justify-between gap-3">
              <button
                (click)="prevQuestion()"
                [disabled]="currentQuestionIndex === 0"
                class="px-3 sm:px-4 py-2 rounded-xs bg-white border border-[#D7DBDE] text-xs font-semibold text-[#1B1D1F] hover:bg-[#E7F1FA] disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
              >
                ← Précédente
              </button>

              <div class="flex items-center gap-2 sm:gap-3">
                @if (currentQuestionIndex < quiz.questions.length - 1) {
                  <button
                    (click)="nextQuestion()"
                    class="px-3 sm:px-4 py-2 rounded-xs bg-[#1C75BC] hover:bg-[#124F80] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    Suivante →
                  </button>
                } @else {
                  <button
                    (click)="submitQuiz()"
                    [disabled]="submitting"
                    class="px-5 py-2.5 rounded-xs bg-[#276B44] hover:bg-[#1e5234] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>{{ submitting ? 'Calcul sécurisé...' : 'Soumettre le Quiz' }}</span>
                    <span>✓</span>
                  </button>
                }
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class QuizPlayerComponent implements OnInit, OnDestroy {
  quizId = '';
  quiz: QuizDetail | null = null;
  result: QuizSubmissionResult | null = null;
  loading = true;
  submitting = false;

  currentQuestionIndex = 0;
  reponsesMap = new Map<string, number>();

  // Timer
  timerInterval: any = null;
  timeLeftSeconds = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apprenantService: ApprenantService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.quizId = this.route.snapshot.paramMap.get('id') || '';
    if (this.quizId) {
      this.loadQuiz();
    }
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  loadQuiz() {
    this.loading = true;
    this.apprenantService.getQuiz(this.quizId).subscribe({
      next: (data) => {
        this.quiz = data;
        this.loading = false;

        if (!data.tentative && data.dureeMinutes) {
          this.timeLeftSeconds = data.dureeMinutes * 60;
          this.startTimer();
        }
      },
      error: () => {
        this.loading = false;
        this.toast.error('Erreur lors du chargement du quiz.');
      },
    });
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.timeLeftSeconds > 0) {
        this.timeLeftSeconds--;
      } else {
        clearInterval(this.timerInterval);
        this.toast.error('Temps écoulé ! Soumission automatique...');
        this.submitQuiz();
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  get currentQuestion() {
    return this.quiz?.questions[this.currentQuestionIndex];
  }

  goToQuestion(idx: number) {
    this.currentQuestionIndex = idx;
  }

  nextQuestion() {
    if (this.quiz && this.currentQuestionIndex < this.quiz.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  prevQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  selectOption(questionId: string, optionIndex: number) {
    this.reponsesMap.set(questionId, optionIndex);
  }

  getSelectedOption(questionId: string): number | undefined {
    return this.reponsesMap.get(questionId);
  }

  isAnswered(questionId: string): boolean {
    return this.reponsesMap.has(questionId);
  }

  submitQuiz() {
    if (!this.quiz) return;

    const unanswered = this.quiz.questions.length - this.reponsesMap.size;
    if (unanswered > 0) {
      if (!confirm(`Il reste ${unanswered} question(s) sans réponse. Souhaitez-vous vraiment soumettre ?`)) {
        return;
      }
    }

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    const payload = Array.from(this.reponsesMap.entries()).map(([questionId, selectedIndex]) => ({
      questionId,
      selectedIndex,
    }));

    this.submitting = true;
    this.apprenantService.submitQuiz(this.quizId, payload).subscribe({
      next: (res) => {
        this.submitting = false;
        this.result = res;
        this.toast.success(`Quiz terminé ! Score : ${res.score}%`);
      },
      error: (err) => {
        this.submitting = false;
        this.toast.error(err.error?.message || 'Erreur lors de la soumission du quiz.');
      },
    });
  }
}
