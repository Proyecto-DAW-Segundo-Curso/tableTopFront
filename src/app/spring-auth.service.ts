import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpringAuthService {

  private apiUrl = 'http://localhost:3001/api/login'; // Ajusta la URL según tu backend

  constructor(private http: HttpClient, private router: Router) { }

  login(email: string, password: string): Observable<{ token: string }> {
    console.log('Email:', email);
    console.log('Contraseña:', password);
    
    // if (!email || !password) {
    //   return throwError(() => new Error('Email y contraseña son obligatorios.'));
    // }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = JSON.stringify({ email, password });

    return this.http.post<{ token: string }>(
      this.apiUrl,
      body,
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Error en la autenticación:', error);
        return throwError(() => new Error(error.error?.message || 'Error de autenticación'));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

}
