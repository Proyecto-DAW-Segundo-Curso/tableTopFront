import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EventService, Event } from '../services/event.service';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.scss']
})
export class EventosComponent implements OnInit {
  showParticipants: { [key: number]: boolean } = {};
  currentUser: string = 'Usuario1';
  isJoined: { [key: number]: boolean } = {};
  events: Event[] = [];

  constructor(private router: Router, private eventService: EventService) {}

  ngOnInit(): void {
    this.eventService.getEvents().subscribe(events => {
      this.events = events;
      // Inicializar estados para cada evento
      this.events.forEach(event => {
        this.showParticipants[event.id] = false;
        this.isJoined[event.id] = event.participants.includes(this.currentUser);
      });
    });
  }

  navigateToCreateEvent(): void {
    this.router.navigate(['/create-event']);
  }

  toggleParticipantsList(eventId: number): void {
    this.showParticipants[eventId] = !this.showParticipants[eventId];
  }

  toggleJoin(eventId: number): void {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return;

    if (this.isJoined[eventId]) {
      event.participants = event.participants.filter(p => p !== this.currentUser);
    } else {
      if (event.participants.length < event.maxParticipants) {
        event.participants.push(this.currentUser);
      }
    }
    this.isJoined[eventId] = !this.isJoined[eventId];
    this.eventService.updateEvent(event);
  }
}
