import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EventsService } from '../events.service';
import { Event } from '../event';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.scss'],
  providers: [DatePipe]
})
export class EventosComponent implements OnInit, OnChanges {
  @Input() event!: Event;
  @Output() eventDeleted = new EventEmitter<number>();
  @Output() eventUpdated = new EventEmitter<void>();

  showParticipants: boolean = false;
  currentUserId: string = '';
  isJoined: boolean = false;
  error: string = '';
  isLoading: boolean = false;
  participantNames: { [key: string]: string } = {};

  constructor(
    private router: Router, 
    private eventsService: EventsService,
    private authService: AuthService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadParticipantNames();
  }
  
  ngOnChanges(): void {
    this.updateJoinStatus();
    this.loadParticipantNames();
  }

  async loadParticipantNames(): Promise<void> {
    if (!this.event?.participants?.length) return;

    try {
      const user = await this.authService.getCurrentUser();
      if (user) {
        this.participantNames[user.uid] = user.email || user.uid;
        this.event.participants.forEach(id => {
          if (id !== user.uid) {
            this.participantNames[id] = id;
          }
        });
      }
    } catch (error) {
      console.error('Error al cargar nombres de participantes:', error);
    }
  }
  
  formatDateTime(dateTimeStr: string | any[] | undefined): string {
    if (!dateTimeStr) return 'Fecha no disponible';
    
    try {
      if (typeof dateTimeStr === 'string') {
        if (dateTimeStr.includes('T')) {
          return this.datePipe.transform(new Date(dateTimeStr), 'medium') || 'Fecha inválida';
        }
        
        if (dateTimeStr.includes(',')) {
          const parts = dateTimeStr.split(',').map(part => parseInt(part.trim()));
          if (parts.length >= 3) {
            const year = parts[0];
            const month = parts[1] - 1;
            const day = parts[2];
            const hours = parts.length > 3 ? parts[3] : 0;
            const minutes = parts.length > 4 ? parts[4] : 0;
            
            const date = new Date(year, month, day, hours, minutes);
            
            if (isNaN(date.getTime())) {
              console.error('Fecha inválida creada a partir de:', parts);
              return 'Fecha inválida';
            }
            
            return this.datePipe.transform(date, 'medium') || 'Fecha inválida';
          }
        }
      }
      
      if (Array.isArray(dateTimeStr) && dateTimeStr.length >= 3) {
        const year = dateTimeStr[0];
        const month = dateTimeStr[1] - 1;
        const day = dateTimeStr[2];
        const hours = dateTimeStr.length > 3 ? dateTimeStr[3] : 0;
        const minutes = dateTimeStr.length > 4 ? dateTimeStr[4] : 0;
        
        const date = new Date(year, month, day, hours, minutes);
        
        if (isNaN(date.getTime())) {
          console.error('Fecha inválida creada a partir de:', dateTimeStr);
          return 'Fecha inválida';
        }
        
        return this.datePipe.transform(date, 'medium') || 'Fecha inválida';
      }
      
      console.warn('Formato de fecha no reconocido:', dateTimeStr);
      return String(dateTimeStr);
      
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Error de formato';
    }
  }
  
  async loadCurrentUser(): Promise<void> {
    try {
      const user = await this.authService.getCurrentUser();
      if (user) {
        this.currentUserId = user.uid;
        this.updateJoinStatus();
      }
    } catch (error) {
      console.error('Error al obtener el usuario actual:', error);
    }
  }

  updateJoinStatus(): void {
    if (!this.currentUserId || !this.event) return;
    
    if (!this.event.participants || !Array.isArray(this.event.participants)) {
      this.event.participants = [];
      this.isJoined = false;
      return;
    }
    
    this.isJoined = this.event.participants.includes(this.currentUserId);
  }

  navigateToCreateEvent(): void {
    this.router.navigate(['/create-event']);
  }

  navigateToEditEvent(): void {
    if (this.event?.id) {
      this.router.navigate(['/edit-event', this.event.id]);
    }
  }

  toggleParticipantsList(): void {
    this.showParticipants = !this.showParticipants;
  }

  async toggleJoin(): Promise<void> {
    if (!this.currentUserId) {
      alert('Debe iniciar sesión para unirse a un evento');
      return;
    }
    
    if (!this.event.id) {
      console.error('El evento no tiene un ID válido');
      return;
    }
    
    if (this.isLoading) return;
    this.isLoading = true;
    
    try {
      if (this.isJoined) {
        const leaveObs = await this.eventsService.leaveEvent(this.event.id);
        leaveObs.subscribe({
          next: () => {
            this.isJoined = false;
            this.eventUpdated.emit();
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error al salir del evento:', err);
            this.isLoading = false;
          }
        });
      } else {
        if (this.event.participants?.includes(this.currentUserId)) {
          alert('Ya estás unido a este evento');
          this.isLoading = false;
          return;
        }
        
        const joinObs = await this.eventsService.joinEvent(this.event.id);
        joinObs.subscribe({
          next: () => {
            this.isJoined = true;
            this.eventUpdated.emit();
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error al unirse al evento:', err);
            this.isLoading = false;
          }
        });
      }
    } catch (error) {
      console.error('Error en toggleJoin:', error);
      this.isLoading = false;
    }
  }
  
  canDelete(): boolean {
    if (!this.event || !this.currentUserId) return false;
    return this.event.creatorId === this.currentUserId;
  }
  
  canEdit(): boolean {
    return this.canDelete();
  }
  
  async deleteEvent(): Promise<void> {
    if (!this.event.id) {
      console.error('El evento no tiene un ID válido');
      return;
    }
    
    if (this.isLoading) return;
    
    if (confirm('¿Está seguro de que desea eliminar este evento?')) {
      this.isLoading = true;
      try {
        const deleteObs = await this.eventsService.deleteEvent(this.event.id);
        deleteObs.subscribe({
          next: () => {
            this.isLoading = false;
            this.eventDeleted.emit(this.event.id);
          },
          error: (err) => {
            console.error('Error al eliminar el evento:', err);
            this.isLoading = false;
          }
        });
      } catch (error) {
        console.error('Error en deleteEvent:', error);
        this.isLoading = false;
      }
    }
  }

  getParticipantName(id: string): string {
    return this.participantNames[id] || id;
  }
}
