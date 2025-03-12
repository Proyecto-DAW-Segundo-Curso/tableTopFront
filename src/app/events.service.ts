import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable, from, switchMap, catchError, throwError, of, BehaviorSubject, tap } from 'rxjs';
import { Event } from './event';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private apiUrl = 'http://localhost:8080/api/events';
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  events$ = this.eventsSubject.asObservable();

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

  async refreshEvents(): Promise<void> {
    const headers = await this.getHeaders();
    this.http.get<Event[]>(this.apiUrl, { headers }).subscribe({
      next: (events) => this.eventsSubject.next(events),
      error: (error) => console.error('Error al refrescar eventos:', error)
    });
  }

  async getAllEvents(): Promise<Observable<Event[]>> {
    const headers = await this.getHeaders();
    return this.http.get<Event[]>(this.apiUrl, { headers }).pipe(
      tap(events => this.eventsSubject.next(events))
    );
  }

  async getEventById(id: number): Promise<Observable<Event>> {
    const headers = await this.getHeaders();
    return this.http.get<Event>(`${this.apiUrl}/${id}`, { headers });
  }

  async addEvent(event: Event): Promise<Observable<Event>> {
    const headers = await this.getHeaders();
    return this.http.post<Event>(this.apiUrl, event, { headers }).pipe(
      tap(() => this.refreshEvents())
    );
  }

  async updateEvent(id: number, event: Event): Promise<Observable<Event>> {
    const headers = await this.getHeaders();
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event, { headers }).pipe(
      tap(() => this.refreshEvents())
    );
  }

  async deleteEvent(id: number): Promise<Observable<void>> {
    const headers = await this.getHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap(() => this.refreshEvents())
    );
  }

  async joinEvent(id: number): Promise<Observable<Event>> {
    const headers = await this.getHeaders();
    return this.http.post<Event>(`${this.apiUrl}/${id}/join`, {}, { headers }).pipe(
      tap(() => this.refreshEvents())
    );
  }

  async leaveEvent(id: number): Promise<Observable<Event>> {
    const headers = await this.getHeaders();
    return this.http.post<Event>(`${this.apiUrl}/${id}/leave`, {}, { headers }).pipe(
      tap(() => this.refreshEvents())
    );
  }
}
