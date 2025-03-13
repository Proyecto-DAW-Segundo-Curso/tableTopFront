import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EventsService } from '../events.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.scss'
})
export class CreateEventComponent {
  gameForm: FormGroup;
  errorMessage: string = '';
  isSubmitting: boolean = false;
  userId: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private eventService: EventsService,
    private authService: AuthService
  ) {
    this.gameForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      date: ['', Validators.required],
      location: ['', [Validators.required, Validators.minLength(3)]],
      maxParticipants: ['', [Validators.required, Validators.min(1), Validators.max(100)]]
    });

    // Obtener el ID del usuario actual
    this.userId = this.authService.getUserId();
    console.log('User ID:', this.userId);
  }

  onSubmit() {
    if (this.gameForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';

      // Preparar fecha para el formato adecuado
      const dateValue = this.gameForm.get('date')?.value;
      const dateTime = new Date(dateValue);
      
      const eventData = {
        name: this.gameForm.get('title')?.value,
        dateTime: dateTime.toISOString(),
        location: this.gameForm.get('location')?.value,
        maxPlayers: parseInt(this.gameForm.get('maxParticipants')?.value),
        creatorId: this.userId || ''
      };
      
      console.log('Evento a crear:', eventData);

      this.eventService.addEvent(eventData).subscribe({
        next: (response) => {
          console.log('Evento creado exitosamente:', response);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error al crear el evento:', error);
          this.errorMessage = `Error al crear el evento: ${error.message || 'Contacta con el administrador'}`;
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      this.errorMessage = 'Por favor, completa todos los campos correctamente';
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.gameForm.controls).forEach(field => {
        const control = this.gameForm.get(field);
        control?.markAsTouched();
      });
    }
  }
}
