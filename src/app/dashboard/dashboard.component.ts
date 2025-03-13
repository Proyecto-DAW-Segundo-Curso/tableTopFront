import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { EventosComponent } from '../eventos/eventos.component';
import { EventsService } from '../events.service';
import { Event } from '../event';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, EventosComponent, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  userName: string | null = null;
  events: Event[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  currentUserId: string | null = null;
  
  constructor(
    private authService: AuthService,
    private eventsService: EventsService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.loadCurrentUser();
  }
  
  async loadCurrentUser(): Promise<void> {
    try {
      const user = await this.authService.getCurrentUserAsync();
      if (user) {
        this.currentUserId = user.uid;
        this.userName = user.displayName || user.email || 'Usuario';
        this.loadUserEvents();
      } else {
        console.log('Usuario no autenticado');
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Error al obtener el usuario actual:', error);
    }
  }
  
  loadUserEvents(): void {
    this.isLoading = true;
    this.error = null;
    
    this.eventsService.getAllEvents().subscribe({
      next: (events) => {
        console.log('Eventos cargados desde el backend:', events);
        
        // Normalizar los datos de los eventos
        this.events = events.map(event => {
          // Crear una copia para no modificar el original
          const normalizedEvent: Event = { ...event };
          
          // Asegurarse de que participants es un array
          if (!normalizedEvent.participants) {
            normalizedEvent.participants = [];
          } else if (!Array.isArray(normalizedEvent.participants)) {
            try {
              // Si llega como string, intentar parsearlo
              if (typeof normalizedEvent.participants === 'string') {
                normalizedEvent.participants = JSON.parse(normalizedEvent.participants as any);
              }
              // Si sigue sin ser un array después del parseo
              if (!Array.isArray(normalizedEvent.participants)) {
                console.error('No se pudo convertir participants a array:', normalizedEvent.participants);
                normalizedEvent.participants = [];
              }
            } catch (e) {
              console.error('Error al parsear participants:', e);
              normalizedEvent.participants = [];
            }
          }
          
          // Asegurarse de que maxPlayers es un número
          if (normalizedEvent.maxPlayers === undefined || normalizedEvent.maxPlayers === null) {
            normalizedEvent.maxPlayers = 0;
          } else if (typeof normalizedEvent.maxPlayers !== 'number') {
            try {
              normalizedEvent.maxPlayers = Number(normalizedEvent.maxPlayers);
              if (isNaN(normalizedEvent.maxPlayers)) {
                normalizedEvent.maxPlayers = 0;
              }
            } catch (e) {
              console.error('Error al convertir maxPlayers a número:', e);
              normalizedEvent.maxPlayers = 0;
            }
          }
          
          // Procesar el campo dateTime
          if (normalizedEvent.dateTime) {
            // Si ya es un string, no hacemos nada
            if (typeof normalizedEvent.dateTime === 'string' && 
                (normalizedEvent.dateTime.includes('T') || normalizedEvent.dateTime.includes(','))) {
              // Ya está en formato ISO o array como string, lo dejamos así
            } 
            // Si es un array, convertirlo a string ISO
            else if (Array.isArray(normalizedEvent.dateTime)) {
              try {
                const [year, month, day, hours = 0, minutes = 0] = normalizedEvent.dateTime;
                const date = new Date(year, month - 1, day, hours, minutes);
                if (!isNaN(date.getTime())) {
                  normalizedEvent.dateTime = date.toISOString();
                } else {
                  console.error('Fecha inválida para convertir a ISO:', normalizedEvent.dateTime);
                  normalizedEvent.dateTime = normalizedEvent.dateTime.join(',');
                }
              } catch (e) {
                console.error('Error al convertir fecha a ISO:', e);
                if (Array.isArray(normalizedEvent.dateTime)) {
                  normalizedEvent.dateTime = normalizedEvent.dateTime.join(',');
                }
              }
            }
          } else {
            normalizedEvent.dateTime = new Date().toISOString();
          }
          
          return normalizedEvent;
        });
        
        console.log('Eventos normalizados:', this.events);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando eventos:', err);
        this.error = 'No se pudieron cargar los eventos. Intente nuevamente más tarde.';
        this.isLoading = false;
      }
    });
  }
  
  handleEventDeleted(eventId: number): void {
    console.log('Evento eliminado, ID recibido:', eventId);

    // Verificar que eventId es un número válido
    if (!eventId) {
      console.error('ID de evento inválido:', eventId);
      return;
    }

    // Obtener el evento antes de eliminarlo (para debugging)
    const eventToRemove = this.events.find(event => event.id === eventId);
    console.log('Evento a eliminar de la interfaz:', eventToRemove);

    // Eliminar el evento de la lista local
    const initialLength = this.events.length;
    this.events = [...this.events.filter(event => event.id !== eventId)];

    // Verificar que el evento se eliminó correctamente
    if (initialLength === this.events.length) {
      console.warn('No se encontró el evento con ID', eventId, 'en la lista local');
    } else {
      console.log('Evento eliminado de la interfaz correctamente');
    }
  }
    
  handleEventUpdated(): void {
    console.log('Evento actualizado, recargando eventos...');
    // Recargamos todos los eventos para tener la lista actualizada
    this.loadUserEvents();
  }
  
  navigateToCreateEvent(): void {
    this.router.navigate(['/create-event']);
  }
}
