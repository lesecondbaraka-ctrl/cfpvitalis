import { Routes } from '@angular/router';
import {
  authGuard, adminCentreGuard, adminEtabGuard, formateurGuard,
  apprenantGuard, personnelAdminGuard,
} from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./modules/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./modules/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'certificats/verifier/:numeroSerie', loadComponent: () => import('./modules/certificats/verify/verify.component').then(m => m.VerifyComponent) },

  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent) },

  { path: 'admin/etablissements', canActivate: [adminCentreGuard], loadComponent: () => import('./modules/admin-centre/etablissements/etablissements.component').then(m => m.EtablissementsComponent) },
  { path: 'admin/utilisateurs', canActivate: [adminCentreGuard], loadComponent: () => import('./modules/admin-centre/utilisateurs/utilisateurs.component').then(m => m.UtilisateursComponent) },
  { path: 'admin/analytics', canActivate: [adminCentreGuard], loadComponent: () => import('./modules/admin-centre/analytics/analytics.component').then(m => m.AnalyticsComponent) },

  { path: 'admin-etab/dashboard', canActivate: [adminEtabGuard], loadComponent: () => import('./modules/admin-etab/dashboard/dashboard.component').then(m => m.AdminEtabDashboardComponent) },
  { path: 'admin-etab/utilisateurs', canActivate: [adminEtabGuard], loadComponent: () => import('./modules/admin-etab/utilisateurs/utilisateurs-etab.component').then(m => m.UtilisateursEtabComponent) },

  { path: 'formations', canActivate: [formateurGuard], loadComponent: () => import('./modules/formateur/formations/formations.component').then(m => m.FormationsComponent) },
  { path: 'formations/:id', canActivate: [authGuard], loadComponent: () => import('./modules/formateur/formation-detail/formation-detail.component').then(m => m.FormationDetailComponent) },
  { path: 'cours/:id', canActivate: [authGuard], loadComponent: () => import('./modules/apprenant/cours-detail/cours-detail.component').then(m => m.CoursDetailComponent) },
  { path: 'notes', canActivate: [formateurGuard], loadComponent: () => import('./modules/formateur/notes/notes.component').then(m => m.NotesComponent) },
  { path: 'devoirs/noter', canActivate: [formateurGuard], loadComponent: () => import('./modules/formateur/devoirs-noter/devoirs-noter.component').then(m => m.DevoirsNoterComponent) },
  { path: 'seances', canActivate: [formateurGuard], loadComponent: () => import('./modules/seances/seances-list/seances-list.component').then(m => m.SeancesListComponent) },
  { path: 'seances/:id', canActivate: [formateurGuard], loadComponent: () => import('./modules/seances/seance-detail/seance-detail.component').then(m => m.SeanceDetailComponent) },

  { path: 'mes-cours', canActivate: [apprenantGuard], loadComponent: () => import('./modules/apprenant/mes-cours/mes-cours.component').then(m => m.MesCoursComponent) },
  { path: 'mes-certificats', canActivate: [apprenantGuard], loadComponent: () => import('./modules/apprenant/mes-certificats/mes-certificats.component').then(m => m.MesCertificatsComponent) },
  { path: 'mes-quiz', canActivate: [apprenantGuard], loadComponent: () => import('./modules/apprenant/mes-quiz/mes-quiz-list.component').then(m => m.MesQuizComponent) },
  { path: 'quiz/:id', canActivate: [apprenantGuard], loadComponent: () => import('./modules/apprenant/mes-quiz/mes-quiz.component').then(m => m.QuizPasserComponent) },
  { path: 'mes-devoirs', canActivate: [apprenantGuard], loadComponent: () => import('./modules/apprenant/mes-devoirs/mes-devoirs.component').then(m => m.MesDevoirsComponent) },

  { path: 'personnel/assiduite', canActivate: [personnelAdminGuard], loadComponent: () => import('./modules/personnel/assiduite/assiduite.component').then(m => m.AssiduiteComponent) },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', loadComponent: () => import('./modules/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
