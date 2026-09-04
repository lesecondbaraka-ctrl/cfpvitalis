import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NotificationsService } from './core/services/notifications.service';
import { ToastComponent } from './core/components/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  template: `<router-outlet></router-outlet><app-toast></app-toast>`,
})
export class App implements OnInit {
  constructor(
    private notifications: NotificationsService,
    private router: Router,
  ) {}

  ngOnInit() {
    // Restauration de l'URL si arrivée via un fallback 404 de l'hébergeur statique
    try {
      const redirect = sessionStorage.getItem('spa_redirect');
      if (redirect) {
        sessionStorage.removeItem('spa_redirect');
        this.router.navigateByUrl(redirect);
      }
    } catch (e) {
      // Ignorer si sessionStorage indisponible
    }

    // ensure SSE connection is established early so pages receive events
    try {
      this.notifications.connect();
    } catch (e) {
      console.error('Failed to connect notifications', e);
    }
  }
}
