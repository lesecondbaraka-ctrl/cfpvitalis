import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PedagogieService } from '../../../core/services/pedagogie.service';
import { CertificationService } from '../../../core/services/certification.service';
import { QuizService } from '../../../core/services/quiz.service';
import { DevoirsService } from '../../../core/services/devoirs.service';
import { MainLayoutComponent } from '../../../shared/layout/main-layout.component';
import { Formation, Module, Evaluation, Utilisateur } from '../../../core/models';

@Component({
  selector: 'app-formation-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, MainLayoutComponent],
  template: `
    <app-main-layout>
      <div class="p-8 max-w-6xl mx-auto">
        @if (formation) {
          <h1 class="text-3xl font-bold text-vc-primary font-heading mb-2">{{ formation.titre }}</h1>
          <p class="text-slate-500 mb-8">{{ formation.description }}</p>

          <div class="flex gap-2 mb-6">
            <button class="btn btn-primary" (click)="showModuleForm = !showModuleForm">+ Module</button>
          </div>

          @if (showModuleForm) {
            <div class="card mb-6 flex gap-4 items-end">
              <div class="flex-1"><label class="form-label">Titre du module</label><input class="form-input" [(ngModel)]="moduleForm.titre" /></div>
              <div><label class="form-label">Coef.</label><input class="form-input w-20" type="number" [(ngModel)]="moduleForm.coefficient" /></div>
              <button class="btn btn-secondary" (click)="addModule()">Ajouter</button>
            </div>
          }

          @for (mod of formation.modules; track mod.id) {
            <div class="card mb-4">
              <div class="flex justify-between items-start">
                <h3 class="font-bold text-vc-secondary">{{ mod.titre }} <span class="text-xs text-slate-400">(coef. {{ mod.coefficient }})</span></h3>
                <button class="btn btn-outline text-xs py-1" (click)="selectedModule = mod; showCoursForm = true">+ Cours</button>
              </div>

              @if (showCoursForm && selectedModule?.id === mod.id) {
                <div class="mt-4 p-4 bg-slate-50 rounded-lg flex gap-4 items-end">
                  <div class="flex-1"><input class="form-input" placeholder="Titre du cours" [(ngModel)]="coursForm.titre" /></div>
                  <button class="btn btn-primary text-sm" (click)="addCours(mod.id)">Ajouter</button>
                </div>
              }

              <ul class="mt-3 space-y-2">
                @for (c of mod.cours; track c.id) {
                  <li class="flex items-center justify-between p-2 bg-vc-bg rounded gap-2">
                    <a [routerLink]="['/cours', c.id]" class="text-sm font-medium flex-1">{{ c.titre }}</a>
                    <span class="text-xs text-slate-400">{{ c.fileUrl ? 'PDF ✓' : 'Texte' }}</span>
                    <label class="btn btn-outline text-xs py-1 px-2 cursor-pointer">
                      Upload
                      <input type="file" class="hidden" accept=".pdf,.doc,.docx" (change)="uploadFile(c.id, $event)" />
                    </label>
                  </li>
                }
              </ul>

              <div class="mt-4 border-t pt-4 space-y-3">
                <button class="btn btn-outline text-xs" (click)="loadEvaluations(mod.id)">Évaluations</button>
                <button class="btn btn-outline text-xs ml-2" (click)="activeQuizModule = mod.id; showQuizForm = true">+ Quiz</button>
                <button class="btn btn-outline text-xs ml-2" (click)="activeDevoirModule = mod.id; showDevoirForm = true">+ Devoir</button>

                @if (showQuizForm && activeQuizModule === mod.id) {
                  <div class="mt-2 p-4 bg-slate-50 rounded-lg space-y-3">
                    <input class="form-input" placeholder="Titre du quiz" [(ngModel)]="quizForm.titre" />
                    <input class="form-input" placeholder="Question 1" [(ngModel)]="quizForm.q1" />
                    <input class="form-input" placeholder="Bonne réponse Q1" [(ngModel)]="quizForm.a1" />
                    <input class="form-input" placeholder="Question 2" [(ngModel)]="quizForm.q2" />
                    <input class="form-input" placeholder="Bonne réponse Q2" [(ngModel)]="quizForm.a2" />
                    <button class="btn btn-secondary text-sm" (click)="createQuiz(mod.id)">Créer le quiz</button>
                  </div>
                }

                @if (showDevoirForm && activeDevoirModule === mod.id) {
                  <div class="mt-2 p-4 bg-slate-50 rounded-lg space-y-3">
                    <input class="form-input" placeholder="Titre du devoir" [(ngModel)]="devoirForm.titre" />
                    <textarea class="form-input" rows="2" placeholder="Consignes" [(ngModel)]="devoirForm.consignes"></textarea>
                    <input class="form-input" type="datetime-local" [(ngModel)]="devoirForm.dateLimite" />
                    <button class="btn btn-secondary text-sm" (click)="createDevoir(mod.id)">Créer le devoir</button>
                  </div>
                }

                @if (activeEvalModule === mod.id) {
                  <div class="mt-2 flex gap-2">
                    <input class="form-input flex-1 text-sm" placeholder="Titre évaluation" [(ngModel)]="evalForm.titre" />
                    <button class="btn btn-secondary text-sm" (click)="addEvaluation(mod.id)">Créer</button>
                  </div>
                  @for (ev of evaluations; track ev.id) {
                    <p class="text-sm mt-1 text-slate-600">• {{ ev.titre }} (/{{ ev.noteMaximale }})</p>
                  }
                }
              </div>
            </div>
          }

          @if (isFormateur) {
            <div class="card mt-6">
              <h3 class="font-bold mb-4">Émettre un certificat</h3>
              <div class="flex gap-4 items-end">
                <div class="flex-1">
                  <label class="form-label">Apprenant</label>
                  <select class="form-input" [(ngModel)]="apprenantId">
                    <option value="">— Sélectionner —</option>
                    @for (a of apprenants; track a.id) {
                      <option [value]="a.id">{{ a.prenom }} {{ a.nom }}</option>
                    }
                  </select>
                </div>
                <button class="btn btn-primary" (click)="emettreCertificat()">Émettre</button>
              </div>
              @if (certMessage) { <p class="text-sm mt-2 text-vc-success">{{ certMessage }}</p> }
            </div>
          }
        }
      </div>
    </app-main-layout>
  `,
})
export class FormationDetailComponent implements OnInit {
  formation: Formation | null = null;
  showModuleForm = false;
  showCoursForm = false;
  selectedModule: Module | null = null;
  moduleForm = { titre: '', coefficient: 1 };
  coursForm = { titre: '' };
  evalForm = { titre: '' };
  evaluations: Evaluation[] = [];
  activeEvalModule = '';
  activeQuizModule = '';
  activeDevoirModule = '';
  showQuizForm = false;
  showDevoirForm = false;
  quizForm = { titre: '', q1: '', a1: '', q2: '', a2: '' };
  devoirForm = { titre: '', consignes: '', dateLimite: '' };
  apprenantId = '';
  certMessage = '';
  apprenants: Utilisateur[] = [];

  constructor(
    private route: ActivatedRoute,
    private pedagogie: PedagogieService,
    private certification: CertificationService,
    private quizService: QuizService,
    private devoirsService: DevoirsService,
  ) {}

  get isFormateur() { return true; }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.pedagogie.getFormation(id).subscribe({ next: (f) => this.formation = f });
    this.pedagogie.getApprenants().subscribe({ next: (a) => this.apprenants = a });
  }

  addModule() {
    if (!this.formation) return;
    this.pedagogie.createModule(this.formation.id, this.moduleForm).subscribe({ next: () => this.ngOnInit() });
  }

  addCours(moduleId: string) {
    this.pedagogie.createCours(moduleId, this.coursForm).subscribe({
      next: () => { this.coursForm = { titre: '' }; this.showCoursForm = false; this.ngOnInit(); },
    });
  }

  loadEvaluations(moduleId: string) {
    this.activeEvalModule = moduleId;
    this.pedagogie.getEvaluations(moduleId).subscribe({ next: (e) => this.evaluations = e });
  }

  addEvaluation(moduleId: string) {
    this.pedagogie.createEvaluation(moduleId, this.evalForm).subscribe({
      next: () => { this.evalForm = { titre: '' }; this.loadEvaluations(moduleId); },
    });
  }

  emettreCertificat() {
    if (!this.formation || !this.apprenantId) return;
    this.certification.emettre(this.formation.id, this.apprenantId).subscribe({
      next: (res: any) => { this.certMessage = res.message || 'Certificat émis'; },
      error: (e) => { this.certMessage = e.error?.message || 'Erreur'; },
    });
  }

  uploadFile(coursId: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.pedagogie.uploadCoursFile(coursId, file).subscribe({
      next: () => this.ngOnInit(),
    });
  }

  createQuiz(moduleId: string) {
    this.quizService.create(moduleId, {
      titre: this.quizForm.titre,
      questions: [
        {
          enonce: this.quizForm.q1,
          options: [
            { text: this.quizForm.a1, correct: true },
            { text: 'Autre réponse', correct: false },
          ],
        },
        {
          enonce: this.quizForm.q2,
          options: [
            { text: this.quizForm.a2, correct: true },
            { text: 'Autre réponse', correct: false },
          ],
        },
      ],
    }).subscribe({
      next: () => {
        this.showQuizForm = false;
        this.quizForm = { titre: '', q1: '', a1: '', q2: '', a2: '' };
      },
    });
  }

  createDevoir(moduleId: string) {
    this.devoirsService.create(moduleId, {
      titre: this.devoirForm.titre,
      consignes: this.devoirForm.consignes,
      dateLimite: this.devoirForm.dateLimite ? new Date(this.devoirForm.dateLimite).toISOString() : undefined,
    }).subscribe({
      next: () => {
        this.showDevoirForm = false;
        this.devoirForm = { titre: '', consignes: '', dateLimite: '' };
      },
    });
  }
}
