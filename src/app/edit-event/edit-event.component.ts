import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
  styleUrl: './edit-event.component.scss',
  providers: [DatePipe]
})
export class EditEventComponent implements OnInit {
  eventForm!: FormGroup;
  eventId!: number;
  loading = false;
  submitting = false;
  error: string | null = null;
  event: Event | null = null;
  currentUserId: string = '';
  eventData: Event | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private eventsService: EventsService,
    private authService: AuthService,
    private datePipe: DatePipe
  ) { 
    this.eventForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      location: ['', Validators.required],
      dateTime: ['', Validators.required],
      maxPlayers: [1, [Validators.required, Validators.min(1), Validators.max(100)]]
    });
  }

  async ngOnInit() {
    try {
      // Cargar información del evento
      this.route.params.subscribe(params => {
        this.eventId = params['id'];
        this.loadEvent();
      });

      // Cargar usuario actual
      const user = await this.authService.getCurrentUserAsync();
      
      if (user) {
        this.currentUserId = user.uid;
      } else {
        this.router.navigate(['/login']);
      }

    } catch (error) {
      console.error('Error al cargar la página de edición', error);
    }
  }
  
  async loadEvent(): Promise<void> {
    if (!this.eventId) {
      console.error('ID de evento inválido:', this.eventId);
      this.error = 'ID de evento inválido';
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      console.log('Intentando cargar evento con ID:', this.eventId);
      const eventFound = await this.eventsService.getEvent(this.eventId).toPromise();
      console.log('Evento recibido:', eventFound);

      if (!eventFound) {
        this.error = 'Evento no encontrado';
        return;
      }

      // Verificar si el usuario actual es el creador del evento
      const currentUser = await this.authService.getCurrentUser();
      if (!currentUser || currentUser.uid !== eventFound.creatorId) {
        console.warn(`Usuario ${currentUser?.uid} no es el creador del evento (creador: ${eventFound.creatorId})`);
        this.error = 'No tienes permiso para editar este evento';
        return;
      }

      // Asignar el evento encontrado a eventData
      this.eventData = eventFound;

      // Actualizar el formulario con los datos del evento
      this.eventForm.patchValue({
        name: eventFound.name,
        dateTime: this.formatDateForInput(eventFound.dateTime),
        location: eventFound.location,
        maxPlayers: eventFound.maxPlayers
      });
    } catch (error) {
      console.error('Error al cargar el evento:', error);
      this.error = 'Error al cargar el evento';
    } finally {
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
      
      // Si es un array
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
      console.error('Error al formatear fecha:', error, 'Valor original:', dateTimeStr);
      return 'Error de formato';
    }
  }

  formatDateForInput(dateTimeStr: string | null): string {
    if (!dateTimeStr) return '';
    
    try {
      // Si es un string con formato ISO
      if (typeof dateTimeStr === 'string') {
        if (dateTimeStr.includes('T')) {
          return dateTimeStr.substring(0, 16);
        }
        
        // Si es un string que contiene una lista separada por comas
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
              return '';
            }
            
            return date.toISOString().substring(0, 16);
          }
        }
      }
      
      // Si es un array
      if (Array.isArray(dateTimeStr) && dateTimeStr.length >= 3) {
        const year = dateTimeStr[0];
        const month = dateTimeStr[1] - 1;
        const day = dateTimeStr[2];
        const hours = dateTimeStr.length > 3 ? dateTimeStr[3] : 0;
        const minutes = dateTimeStr.length > 4 ? dateTimeStr[4] : 0;
        
        const date = new Date(year, month, day, hours, minutes);
        
        if (isNaN(date.getTime())) {
          console.error('Fecha inválida creada a partir de:', dateTimeStr);
          return '';
        }
        
        return date.toISOString().substring(0, 16);
      }
      
      console.warn('Formato de fecha no reconocido:', dateTimeStr);
      return '';
      
    } catch (error) {
      console.error('Error al formatear fecha:', error, 'Valor original:', dateTimeStr);
      return '';
    }
  }
}
