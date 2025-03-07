import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Event } from './event';
import { EventParticipants } from './event-participants';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EventsService {


  baseUrl = 'http://localhost:8080/api/events';

  constructor( private http: HttpClient, private authService: AuthService ) {
   }

  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.baseUrl);
  }

  async addEvent(event: Event): Promise< Observable<Event>> {

    const token = await this.authService.getToken();

    const headers = new HttpHeaders({
      'content-type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.baseUrl}/create-event`, event, {
      headers
    });
  }
}
