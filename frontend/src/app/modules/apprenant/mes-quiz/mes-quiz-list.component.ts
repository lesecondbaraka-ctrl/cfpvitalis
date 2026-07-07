import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PedagogieService } from '../../../core/services/pedagogie.service';
import { QuizService, Quiz, TentativeQuiz } from '../../../core/services/quiz.service';
import { MainLayoutComponent } from '../../../shared/layout/main-layout.component';

@Component({
  selector: 'app-mes-quiz',
  standalone: true,
  imports: [RouterLink, MainLayoutComponent],
  template: `
    <app-main-layout>
      <div class="p-8 max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-vc-primary font-heading mb-8">Mes Quiz</h1>

        <h2 class="font-bold text-vc-secondary mb-4">Quiz disponibles</h2>
        <div class="space-y-3 mb-8">
          @for (q of availableQuiz; track q.id) {
            <div class="card flex justify-between items-center">
              <div>
                <h3 class="font-bold">{{ q.titre }}</h3>
                <p class="text-xs text-slate-500">{{ q._count?.questions ?? 0 }} questions</p>
              </div>
              <a [routerLink]="['/quiz', q.id]" class="btn btn-primary text-sm">Passer le quiz</a>
            </div>
          } @empty {
            <p class="text-slate-500">Aucun quiz disponible.</p>
          }
        </div>

        <h2 class="font-bold text-vc-secondary mb-4">Mes résultats</h2>
        @for (t of tentatives; track t.id) {
          <div class="card mb-3 flex justify-between">
            <div>
              <h3 class="font-medium">{{ t.quiz?.titre }}</h3>
              <p class="text-xs text-slate-500">{{ t.quiz?.module?.formation?.titre }}</p>
            </div>
            <span class="badge badge-personnel-admin">{{ t.score }}%</span>
          </div>
        }
      </div>
    </app-main-layout>
  `,
})
export class MesQuizComponent implements OnInit {
  availableQuiz: Quiz[] = [];
  tentatives: TentativeQuiz[] = [];

  constructor(private pedagogie: PedagogieService, private quizService: QuizService) {}

  ngOnInit() {
    this.quizService.mesTentatives().subscribe({ next: (t) => this.tentatives = t });
    this.pedagogie.getFormations().subscribe({
      next: (formations) => formations.forEach(f =>
        this.pedagogie.getFormation(f.id).subscribe({
          next: (full) => full.modules?.forEach(m =>
            this.quizService.getByModule(m.id).subscribe({
              next: (quizzes) => this.availableQuiz.push(...quizzes),
            }),
          ),
        }),
      ),
    });
  }
}
