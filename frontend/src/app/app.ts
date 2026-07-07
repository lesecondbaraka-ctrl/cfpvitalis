import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationsService } from './core/services/notifications.service';
import { ToastComponent } from './core/components/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  template: `<router-outlet></router-outlet><app-toast />`,
})
export class App implements OnInit {
  constructor(private notifications: NotificationsService) {}
  ngOnInit() {
    // ensure SSE connection is established early so pages receive events
    try { this.notifications.connect(); } catch (e) { console.error('Failed to connect notifications', e); }
  }
}
