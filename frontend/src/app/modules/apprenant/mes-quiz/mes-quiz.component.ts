import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuizService, Quiz, QuestionQuiz } from '../../../core/services/quiz.service';
import { MainLayoutComponent } from '../../../shared/layout/main-layout.component';

@Component({
  selector: 'app-quiz-passer',
  standalone: true,
  imports: [FormsModule, MainLayoutComponent, RouterLink],
  template: `
    <app-main-layout>
      <div class="p-8 max-w-3xl mx-auto">
        @if (quiz && !submitted) {
          <h1 class="text-2xl font-bold text-vc-primary mb-6">{{ quiz.titre }}</h1>
          @for (q of quiz.questions; track q.id; let i = $index) {
            <div class="card mb-4">
              <p class="font-bold mb-3">{{ i + 1 }}. {{ q.enonce }}</p>
              @for (opt of q.options; track opt.text; let j = $index) {
                <label class="flex items-center gap-2 mb-2 cursor-pointer">
                  <input type="radio" [name]="'q' + q.id" [value]="j" (change)="setAnswer(q.id, j)" />
                  <span>{{ opt.text }}</span>
                </label>
              }
            </div>
          }
          <button class="btn btn-primary" (click)="submit()" [disabled]="!canSubmit()">Valider le quiz</button>
        }
        @if (submitted && result) {
          <div class="card text-center p-12">
            <h2 class="text-3xl font-bold text-vc-primary mb-4">Score : {{ result.score }}%</h2>
            <p class="text-slate-500 mb-6">Quiz terminé avec succès</p>
            <a routerLink="/mes-quiz" class="btn btn-primary">Retour à mes quiz</a>
          </div>
        }
      </div>
    </app-main-layout>
  `,
})
export class QuizPasserComponent implements OnInit {
  quiz: Quiz | null = null;
  answers: Record<string, number> = {};
  submitted = false;
  result: { score: number } | null = null;

  constructor(private route: ActivatedRoute, private quizService: QuizService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.quizService.getOne(id).subscribe({ next: (q) => this.quiz = q });
  }

  setAnswer(questionId: string, index: number) {
    this.answers[questionId] = index;
  }

  canSubmit() {
    return this.quiz?.questions?.every(q => this.answers[q.id] !== undefined);
  }

  submit() {
    if (!this.quiz) return;
    const reponses = Object.entries(this.answers).map(([questionId, selectedIndex]) => ({ questionId, selectedIndex }));
    this.quizService.submit(this.quiz.id, reponses).subscribe({
      next: (r) => { this.result = r; this.submitted = true; },
    });
  }
}
