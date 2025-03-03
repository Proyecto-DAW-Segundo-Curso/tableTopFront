import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isLoggedIn = false; // Estado de autenticación

  constructor(private authService: AuthService, private router: Router) {
    // Verifica si el usuario está logueado
    this.isLoggedIn = this.authService.isAuthenticated();
    console.log('Is logged in:', this.isLoggedIn);
    
  }

  // Método para redirigir al login
  redirectToLogin() {
    this.router.navigate(['/login']);
  }

  // Método para cerrar sesión (opcional)
  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}
