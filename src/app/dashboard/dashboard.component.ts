import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  userName: string | null = null;

  constructor(private authService: AuthService) {
    this.userName = this.authService.getUserName();
  }

}
