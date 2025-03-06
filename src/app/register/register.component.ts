import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SpringAuthService } from '../spring-auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: SpringAuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      userName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Método para manejar el envío del formulario
  onSubmit() {
    console.log('Estado del formulario:', this.registerForm.value);
    
    if (this.registerForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    const formValues = this.registerForm.value;
    const nombre = formValues.userName?.trim();
    const email = formValues.email?.trim();
    const password = formValues.password?.trim();

    if (!nombre || !email || !password) {
      this.errorMessage = 'Todos los campos son obligatorios.';
      return;
    }

    this.authService.register(nombre, email, password).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        this.successMessage = 'Registro exitoso. Redirigiendo al login...';
        this.errorMessage = '';
        
        // Esperar 2 segundos antes de redirigir
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error en el registro:', err);
        this.errorMessage = err.message || 'Error en el registro. Por favor intenta nuevamente.';
        this.successMessage = '';
      }
    });
  }
}
