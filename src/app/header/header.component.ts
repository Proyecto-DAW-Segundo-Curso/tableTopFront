import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="bg-gray-800 text-white p-4">
      <div class="container mx-auto flex justify-between items-center">
        <div class="flex items-center">
          <img src="assets/logo.png" alt="TableTop Logo" class="h-8 w-8 mr-2">
          <h1 class="text-xl font-bold">TableTop</h1>
        </div>
        
        <nav *ngIf="currentUser$ | async as user">
          <ul class="flex space-x-4">
            <li>
              <a routerLink="/eventos" class="hover:text-gray-300">Volver a Eventos</a>
            </li>
            <li>
              <a routerLink="/create-event" class="hover:text-gray-300">+ Crear Evento</a>
            </li>
            <li class="text-gray-400">
              {{ user.displayName }}
            </li>
            <li>
              <button (click)="logout()" class="hover:text-gray-300">Salir</button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    header {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `]
})
export class HeaderComponent implements OnInit {
  currentUser$: Observable<User | null>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {}

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
    this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
  }
  }
}
