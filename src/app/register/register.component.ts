import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SpringAuthService } from '../spring-auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private router: Router, private authService: SpringAuthService) {
    // Inicializa el formulario reactivo
    this.registerForm = this.fb.group({
      userName: ['user', ],
      email: ['user@gmail.com', ],
      password: ['user1234', ],
    })
  }

  // Método para manejar el envío del formulario
  onSubmit() {

  }
}
