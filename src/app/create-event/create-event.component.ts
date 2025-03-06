import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private fb: FormBuilder, private router: Router) {
    // Inicializa el formulario reactivo
    this.gameForm = this.fb.group({
      description: ['Descripción del evento',],
      date: ['dd/mm/aaaa',],
      address: ['Ubicación del evento',],
      limit: ['Límite de participantes',],
    })
  }

  // Método para manejar el envío del formulario
  onSubmit() {

  }
}
