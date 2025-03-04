import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly validEmail = 'user@gmail.com'; // Credenciales fijas
  private readonly validPassword = 'user1234';
  private authenticate = false; // Simula el estado de autenticación

  constructor( private router: Router ) { }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return this.authenticate;
  }

  // Método para simular el inicio de sesión
  login( email: string, password: string): boolean {
    if (email === this.validEmail && password === this.validPassword) {
      this.authenticate = true;
      this.router.navigate(['/dashboard']); // Redirige al dashboard
      return true;
    }
    return false;
  }

  // Método para simular el cierre de sesión
  logout() {
    this.authenticate = false;
    this.router.navigate(['/login']);
  }
}
