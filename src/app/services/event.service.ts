import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  maxParticipants: number;
  participants: string[];
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private events: Event[] = [
    {
      id: 1,
      title: 'Dungeons & Dragons - La Tumba de la Aniquilación',
      description: 'Partida de D&D',
      date: '2024-04-01',
      location: 'Sala 1',
      maxParticipants: 6,
      participants: ['Usuario2', 'Usuario3']
    }
  ];

  private eventsSubject = new BehaviorSubject<Event[]>(this.events);

  constructor() {}

  getEvents(): Observable<Event[]> {
    return this.eventsSubject.asObservable();
  }

  addEvent(event: Omit<Event, 'id' | 'participants'>): void {
    const newEvent: Event = {
      ...event,
      id: this.events.length + 1,
      participants: []
    };
    
    this.events.push(newEvent);
    this.eventsSubject.next(this.events);
  }

  updateEvent(event: Event): void {
    const index = this.events.findIndex(e => e.id === event.id);
    if (index !== -1) {
      this.events[index] = event;
      this.eventsSubject.next(this.events);
    }
  }
} 