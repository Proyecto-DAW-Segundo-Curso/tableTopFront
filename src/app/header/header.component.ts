import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isLoggedIn = false; // Estado de autenticación
  currentUser = 'Usuario1'; // Por ahora hardcodeado, luego vendrá del servicio

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

  navigateToCreateEvent() {
    this.router.navigate(['/create-event']);
  }
}
