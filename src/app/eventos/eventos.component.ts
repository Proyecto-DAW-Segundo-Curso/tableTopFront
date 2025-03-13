import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EventsService } from '../events.service';
import { Event } from '../event';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.scss'],
  providers: [DatePipe]
})
export class EventosComponent implements OnInit, OnChanges {
  @Input() event!: Event; // Recibe un único evento
  @Output() eventDeleted = new EventEmitter<number>(); // Emite el ID del evento eliminado
  @Output() eventUpdated = new EventEmitter<void>(); // Notifica cuando un evento ha sido actualizado

  showParticipants: boolean = false;
  currentUserId: string = '';
  isJoined: boolean = false;
  error: string = '';
  isLoading: boolean = false;
  
  // Mapa para almacenar nombres de usuarios
  userNames: {[key: string]: string} = {};
  loadingUserNames: boolean = false;

  constructor(
    private router: Router, 
    private eventsService: EventsService,
    private authService: AuthService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }
  
  ngOnChanges(): void {
    // Cuando cambie el evento, actualizar el estado
    this.updateJoinStatus();
    
    // Si el evento tiene participantes, cargar sus nombres
    if (this.event && this.event.participants && this.event.participants.length > 0) {
      this.loadUserNames();
    }
  }
  
  // Cargar nombres de usuarios participantes
  loadUserNames(): void {
    if (!this.event || !this.event.participants || this.event.participants.length === 0) {
      return;
    }
    
    // Añadir también el creador para obtener su nombre
    const userIds = [...this.event.participants];
    if (this.event.creatorId && !userIds.includes(this.event.creatorId)) {
      userIds.push(this.event.creatorId);
    }
    
    this.loadingUserNames = true;
    
    this.eventsService.getUserNames(userIds).subscribe({
      next: (names) => {
        this.userNames = names;
        this.loadingUserNames = false;
      },
      error: (err) => {
        console.error('Error al cargar nombres de usuarios:', err);
        this.loadingUserNames = false;
      }
    });
  }
  
  // Obtener nombre de usuario por ID
  getUserName(userId: string): string {
    return this.userNames[userId] || `Usuario ${userId.substring(0, 5)}...`;
  }
  
  // Obtener nombre del creador del evento
  getCreatorName(): string {
    if (!this.event || !this.event.creatorId) {
      return 'Desconocido';
    }
    return this.getUserName(this.event.creatorId);
  }
  
  // Verificar si el usuario actual es el creador
  isCreator(): boolean {
    return this.event?.creatorId === this.currentUserId;
  }

  formatDateTime(dateTimeStr: string | any[] | undefined): string {
    if (!dateTimeStr) return 'Fecha no disponible';
    
    try {
      // Si es un string con formato ISO
      if (typeof dateTimeStr === 'string') {
        if (dateTimeStr.includes('T')) {
          return this.datePipe.transform(new Date(dateTimeStr), 'medium') || 'Fecha inválida';
        }
        
        // Si es un string que contiene una lista separada por comas
        if (dateTimeStr.includes(',')) {
          const parts = dateTimeStr.split(',').map(part => parseInt(part.trim()));
          if (parts.length >= 3) {
            // Meses en JavaScript comienzan desde 0 (enero = 0)
            const year = parts[0];
            const month = parts[1] - 1; // Restar 1 al mes
            const day = parts[2];
            const hours = parts.length > 3 ? parts[3] : 0;
            const minutes = parts.length > 4 ? parts[4] : 0;
            
            const date = new Date(year, month, day, hours, minutes);
            
            // Verificar si la fecha es válida
            if (isNaN(date.getTime())) {
              console.error('Fecha inválida creada a partir de:', parts);
              return 'Fecha inválida';
            }
            
            return this.datePipe.transform(date, 'medium') || 'Fecha inválida';
          }
        }
      }
      
      // Si es un array
      if (Array.isArray(dateTimeStr) && dateTimeStr.length >= 3) {
        const year = dateTimeStr[0];
        const month = dateTimeStr[1] - 1; // Restar 1 al mes
        const day = dateTimeStr[2];
        const hours = dateTimeStr.length > 3 ? dateTimeStr[3] : 0;
        const minutes = dateTimeStr.length > 4 ? dateTimeStr[4] : 0;
        
        const date = new Date(year, month, day, hours, minutes);
        
        // Verificar si la fecha es válida
        if (isNaN(date.getTime())) {
          console.error('Fecha inválida creada a partir de:', dateTimeStr);
          return 'Fecha inválida';
        }
        
        return this.datePipe.transform(date, 'medium') || 'Fecha inválida';
      }
      
      // Si llegamos aquí, no pudimos manejar el formato
      console.warn('Formato de fecha no reconocido:', dateTimeStr);
      return String(dateTimeStr);
      
    } catch (error) {
      console.error('Error al formatear fecha:', error, 'Valor original:', dateTimeStr);
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
    
    // Verificar si el evento tiene un array de participantes
    if (!this.event.participants || !Array.isArray(this.event.participants)) {
      this.event.participants = [];
      this.isJoined = false;
      return;
    }
    
    // Verificar si el usuario actual está en la lista de participantes
    this.isJoined = this.event.participants.includes(this.currentUserId);
    console.log(`Usuario ${this.currentUserId} está en evento ${this.event.id}:`, this.isJoined);
  }

  navigateToCreateEvent(): void {
    this.router.navigate(['/create-event']);
  }

  toggleParticipantsList(): void {
    this.showParticipants = !this.showParticipants;
    
    // Si mostramos la lista de participantes y no hemos cargado los nombres aún
    if (this.showParticipants && this.event && this.event.participants && 
        this.event.participants.length > 0 && Object.keys(this.userNames).length === 0) {
      this.loadUserNames();
    }
  }

  toggleJoin(): void {
    if (!this.currentUserId) {
      alert('Debe iniciar sesión para unirse a un evento');
      return;
    }
    
    if (!this.event.id) {
      console.error('El evento no tiene un ID válido');
      return;
    }
    
    // Evitar múltiples clics mientras se procesa
    if (this.isLoading) return;
    this.isLoading = true;
    
    if (this.isJoined) {
      // Retirarse del evento
      this.eventsService.leaveEvent(this.event.id).subscribe({
        next: (response) => {
          console.log('Respuesta al salir del evento:', response);
          this.isJoined = false;
          this.isLoading = false;
          this.eventUpdated.emit(); // Notificar al padre que el evento ha sido actualizado
        },
        error: (err) => {
          console.error('Error al salir del evento:', err);
          alert('No se pudo salir del evento. Intente nuevamente.');
          this.isLoading = false;
        }
      });
    } else {
      // Validación para no unirse más de una vez
      if (this.event.participants && 
          Array.isArray(this.event.participants) && 
          this.event.participants.includes(this.currentUserId)) {
        alert('Ya estás unido a este evento');
        this.isLoading = false;
        return;
      }
      
      // Unirse al evento
      this.eventsService.joinEvent(this.event.id).subscribe({
        next: (response) => {
          console.log('Respuesta al unirse al evento:', response);
          this.isJoined = true;
          this.isLoading = false;
          this.eventUpdated.emit(); // Notificar al padre que el evento ha sido actualizado
        },
        error: (err) => {
          console.error('Error al unirse al evento:', err);
          alert('No se admiten más participantes, lo sentimos.');
          this.isLoading = false;
        }
      });
    }
  }
  
  canDelete(): boolean {
    if (!this.event || !this.currentUserId) return false;
    console.log('CanDelete - CreatorId:', this.event.creatorId, 'CurrentId:', this.currentUserId);
    return this.event.creatorId === this.currentUserId;
  }
  
  deleteEvent(): void {
    if (!this.event.id) {
      console.error('El evento no tiene un ID válido');
      return;
    }
    
    // Evitar múltiples clics mientras se procesa
    if (this.isLoading) return;
    
    if (confirm('¿Está seguro de que desea eliminar este evento?')) {
      this.isLoading = true;
      this.eventsService.deleteEvent(this.event.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.eventDeleted.emit(this.event.id); // Emitir el ID del evento eliminado
        },
        error: (err) => {
          console.error('Error al eliminar el evento:', err);
          alert('No se pudo eliminar el evento. Intente nuevamente.');
          this.isLoading = false;
        }
      });
    }
  }

  editEvent(): void {
    if (!this.event.id) {
      console.error('El evento no tiene un ID válido');
      return;
    }
    
    this.router.navigate(['/edit-event', this.event.id]);
  }
}
