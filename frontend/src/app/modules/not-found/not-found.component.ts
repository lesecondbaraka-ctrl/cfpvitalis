import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-vc-bg p-8">
      <div class="text-6xl mb-4">📄</div>
      <h1 class="text-3xl font-bold text-vc-primary font-heading mb-2">Page introuvable</h1>
      <p class="text-vc-text mb-6 text-center text-sm">La page que vous cherchez n'existe pas.</p>
      <a routerLink="/dashboard" class="btn btn-primary">Retour au tableau de bord</a>
    </div>
  `,
})
export class NotFoundComponent {}
