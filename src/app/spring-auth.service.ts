import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpringAuthService { 

  private apiUrl = 'http://localhost:3001/api';  // URL base

  constructor(private http: HttpClient, private router: Router) { }

  register(nombre: string, email: string, contrasenia: string): Observable<any> {
    console.log('Datos de registro recibidos:', { nombre, email, contrasenia: '***' });
    
    if (!nombre?.trim() || !email?.trim() || !contrasenia?.trim()) {
      console.log('Validación fallida: campos vacíos o solo espacios');
      return throwError(() => new Error('Todos los campos son obligatorios.'));
    }

    const headers = new HttpHeaders({ 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    const body = {
      nombre: nombre.trim(),
      email: email.trim(),
      contrasenia: contrasenia.trim()
    };

    console.log('Enviando registro al backend:', { ...body, contrasenia: '***' });

    return this.http.post(`${this.apiUrl}/register`, body, { headers }).pipe(
      tap(response => console.log('Registro exitoso:', response)),
      catchError(error => {
        console.error('Error en el registro:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message
        });
        return throwError(() => new Error(error.error?.message || 'Error en el registro'));
      })
    );
  }

  login(email: string, password: string): Observable<{ token: string }> {
    console.log('Valores recibidos en el servicio:', { email: email || 'vacío', password: password ? '***' : 'vacío' });
    
    if (!email?.trim() || !password?.trim()) {
      console.log('Validación fallida: campos vacíos o solo espacios');
      return throwError(() => new Error('Email y contraseña son obligatorios.'));
    }

    const headers = new HttpHeaders({ 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    const body = { 
      email: email.trim(), 
      contrasenia: password.trim() 
    };

    console.log('Enviando al backend:', { ...body, contrasenia: '***' });

    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, body, { headers }).pipe(
      tap(response => {
        console.log('Respuesta exitosa del servidor:', { token: response.token ? 'presente' : 'ausente' });
        localStorage.setItem('token', response.token);
      }),
      catchError(error => {
        console.error('Error detallado:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message
        });
        return throwError(() => new Error(error.error?.message || 'Error de autenticación'));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
