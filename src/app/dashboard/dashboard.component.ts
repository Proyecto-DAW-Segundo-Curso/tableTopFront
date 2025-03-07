import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { EventosComponent } from '../eventos/eventos.component';

@Component({
  selector: 'app-dashboard',
  imports: [EventosComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  userName: string | null = null;

  constructor(private authService: AuthService) {
    this.userName = this.authService.getUserName();
  }

}
