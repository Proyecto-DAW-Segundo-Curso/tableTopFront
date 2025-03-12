import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable, from, switchMap, catchError, throwError, of } from 'rxjs';
import { Event } from './event';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private apiUrl = 'http://localhost:8080/api/events';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Método para obtener el token y crear los headers
  private async getHeaders(): Promise<HttpHeaders> {
    try {
      const token = await this.authService.getToken();
      if (!token) {
        console.error('No se pudo obtener el token de autenticación');
        throw new Error('No se pudo obtener el token de autenticación');
      }
      
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
      
      console.log('Headers generados correctamente');
      return headers;
    } catch (error) {
      console.error('Error al obtener headers:', error);
      throw error;
    }
  }

  // Crear un nuevo evento
  addEvent(event: any): Observable<Event> {
    console.log('Enviando evento al backend:', event);
    
    return from(this.getHeaders()).pipe(
      switchMap(headers => {
        console.log('Realizando petición POST a:', `${this.apiUrl}/create-event`);
        return this.http.post<Event>(`${this.apiUrl}/create-event`, event, { 
          headers,
          withCredentials: true
        });
      }),
      catchError(error => {
        console.error('Error en addEvent:', error);
        return throwError(() => new Error(error.message || 'Error al crear el evento'));
      })
    );
  }

  // Obtener todos los eventos
  getAllEvents(): Observable<Event[]> {
    return from(this.getHeaders()).pipe(
      switchMap(headers => {
        return this.http.get<Event[]>(`${this.apiUrl}/`, { 
          headers,
          withCredentials: true
        });
      }),
      catchError(error => {
        console.error('Error en getAllEvents:', error);
        return throwError(() => new Error(error.message || 'Error al obtener los eventos'));
      })
    );
  }

  // Eliminar un evento
  deleteEvent(eventId: number): Observable<any> {
    return from(this.getHeaders()).pipe(
      switchMap(headers => {
        return this.http.delete(`${this.apiUrl}/${eventId}`, { 
          headers,
          withCredentials: true,
          responseType: 'text'
        });
      }),
      catchError(error => {
        console.error('Error en deleteEvent:', error);
        return throwError(() => new Error(error.message || 'Error al eliminar el evento'));
      })
    );
  }

  // Unirse a un evento
  joinEvent(eventId: number): Observable<any> {
    return from(this.getHeaders()).pipe(
      switchMap(headers => {
        return this.http.post(`${this.apiUrl}/${eventId}/join`, {}, { 
          headers,
          withCredentials: true
        });
      }),
      catchError(error => {
        console.error('Error en joinEvent:', error);
        return throwError(() => new Error(error.message || 'Error al unirse al evento'));
      })
    );
  }

  // Salir de un evento
  leaveEvent(eventId: number): Observable<any> {
    return from(this.getHeaders()).pipe(
      switchMap(headers => {
        return this.http.post(`${this.apiUrl}/${eventId}/leave`, {}, { 
          headers,
          withCredentials: true
        });
      }),
      catchError(error => {
        console.error('Error en leaveEvent:', error);
        return throwError(() => new Error(error.message || 'Error al salir del evento'));
      })
    );
  }

  // Actualizar un evento
  updateEvent(eventId: number, event: Event): Observable<Event> {
    return from(this.getHeaders()).pipe(
      switchMap(headers => {
        return this.http.put<Event>(`${this.apiUrl}/${eventId}`, event, { 
          headers,
          withCredentials: true
        });
      }),
      catchError(error => {
        console.error('Error en updateEvent:', error);
        return throwError(() => new Error(error.message || 'Error al actualizar el evento'));
      })
    );
  }

  // Obtener nombres de usuarios por IDs
  getUserNames(userIds: string[]): Observable<{[key: string]: string}> {
    return from(this.getHeaders()).pipe(
      switchMap(headers => {
        return this.http.post<{[key: string]: string}>(`${this.apiUrl}/user-names`, userIds, {
          headers,
          withCredentials: true
        });
      }),
      catchError(error => {
        console.error('Error al obtener nombres de usuarios:', error);
        return of({}); // Retorna un objeto vacío en caso de error
      })
    );
  }
}
