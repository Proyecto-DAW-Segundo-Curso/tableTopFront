import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventsService } from '../events.service';
import { Event } from '../event';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.scss']
})
export class EditEventComponent implements OnInit {
  eventForm: FormGroup;
  eventId: number | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private eventsService: EventsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.eventForm = this.fb.group({
      name: ['', [Validators.required]],
      location: ['', [Validators.required]],
      dateTime: ['', [Validators.required]],
      maxPlayers: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.eventId = +params['id'];
        this.loadEvent();
      }
    });
  }

  async loadEvent(): Promise<void> {
    if (!this.eventId) return;

    this.isLoading = true;
    try {
      const getEventObs = await this.eventsService.getEventById(this.eventId);
      const event = await firstValueFrom(getEventObs);
      
      if (event) {
        // Formatear la fecha para el input datetime-local
        const date = new Date(event.dateTime);
        const formattedDate = date.toISOString().slice(0, 16);

        this.eventForm.patchValue({
          name: event.name,
          location: event.location,
          dateTime: formattedDate,
          maxPlayers: event.maxPlayers
        });
      }
    } catch (error: any) {
      console.error('Error al cargar el evento:', error);
      this.error = 'No se pudo cargar el evento';
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.eventForm.valid && this.eventId) {
      this.isLoading = true;
      const eventData = this.eventForm.value;
      
      try {
        const updateObs = await this.eventsService.updateEvent(this.eventId, eventData);
        await firstValueFrom(updateObs);
        this.router.navigate(['/dashboard']);
      } catch (error: any) {
        console.error('Error al actualizar el evento:', error);
        this.error = 'No se pudo actualizar el evento';
      } finally {
        this.isLoading = false;
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
