import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventsService } from '../events.service';
import { AuthService } from '../auth.service';
import { Event } from '../event';
import { catchError, finalize, from, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-event.component.html',
  styleUrl: './edit-event.component.scss'
})
export class EditEventComponent implements OnInit {
  eventForm!: FormGroup;
  eventId!: number;
  loading = false;
  submitting = false;
  error: string | null = null;
  event: Event | null = null;
  currentUserId: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private eventsService: EventsService,
    private authService: AuthService
  ) { 
    this.eventForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      location: ['', Validators.required],
      dateTime: ['', Validators.required],
      maxPlayers: [2, [Validators.required, Validators.min(2), Validators.max(20)]]
    });
  }

  ngOnInit(): void {
    this.loading = true;
    
    // Obtener el ID del evento de la URL
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID de evento no encontrado';
      this.loading = false;
      return;
    }
    
    this.eventId = +id;
    if (isNaN(this.eventId) || this.eventId <= 0) {
      this.error = 'ID de evento inválido';
      this.loading = false;
      return;
    }
    
    // Cargar el usuario y después el evento
    this.loadUserAndEvent();
  }
  
  async loadUserAndEvent(): Promise<void> {
    try {
      // Obtener el usuario actual de forma asíncrona
      const user = await this.authService.getCurrentUser();
      
      if (!user) {
        this.error = 'Usuario no autenticado';
        this.loading = false;
        return;
      }
      
      this.currentUserId = user.uid;
      
      // Obtener todos los eventos
      this.eventsService.getAllEvents().subscribe({
        next: (events) => {
          const eventFound = events.find(e => e.id === this.eventId);
          
          if (!eventFound) {
            this.error = 'Evento no encontrado';
            this.loading = false;
            return;
          }
          
          // Comprobar si el usuario es el creador
          if (eventFound.creatorId !== this.currentUserId) {
            this.error = 'No tienes permisos para editar este evento';
            this.loading = false;
            return;
          }
          
          this.event = eventFound;
          
          // Cargar los datos del evento en el formulario
          // Formatear la fecha para el input datetime-local
          let dateTimeStr = '';
          if (eventFound.dateTime) {
            const date = new Date(eventFound.dateTime);
            if (!isNaN(date.getTime())) {
              // Formato YYYY-MM-DDThh:mm
              dateTimeStr = date.toISOString().substring(0, 16);
            }
          }
          
          this.eventForm.patchValue({
            name: eventFound.name,
            location: eventFound.location,
            dateTime: dateTimeStr,
            maxPlayers: eventFound.maxPlayers
          });
          
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error al cargar el evento:', error);
          this.error = error.message || 'Error al cargar el evento';
          this.loading = false;
        }
      });
    } catch (error: any) {
      console.error('Error al obtener el usuario:', error);
      this.error = error.message || 'Error al obtener el usuario';
      this.loading = false;
    }
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.markFormGroupTouched(this.eventForm);
      return;
    }
    
    this.submitting = true;
    const formData = this.eventForm.value;
    
    // Convertir string a Date para dateTime
    const dateTime = formData.dateTime ? new Date(formData.dateTime) : null;
    
    // Preparar el objeto de evento actualizado
    const updatedEvent: Event = {
      id: this.eventId,
      name: formData.name,
      location: formData.location,
      dateTime: dateTime ? dateTime.toISOString() : '',
      maxPlayers: formData.maxPlayers,
      creatorId: this.currentUserId,
      participants: this.event?.participants || []
    };
    
    this.eventsService.updateEvent(this.eventId, updatedEvent)
      .pipe(
        finalize(() => {
          this.submitting = false;
        })
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error: any) => {
          console.error('Error al actualizar el evento:', error);
          this.error = error.message || 'Error al actualizar el evento';
        }
      });
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  cancelEdit(): void {
    this.router.navigate(['/dashboard']);
  }
}
