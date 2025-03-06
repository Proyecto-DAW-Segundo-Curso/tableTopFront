import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
//import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SpringAuthService } from '../spring-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private authService: SpringAuthService, private router: Router) {
    // Inicializa el formulario reactivo
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  // Método para manejar el envío del formulario
  onSubmit() {
    console.log('Estado del formulario:', {
      valid: this.loginForm.valid,
      dirty: this.loginForm.dirty,
      touched: this.loginForm.touched,
      values: {
        email: this.loginForm.get('email')?.value || 'no presente',
        password: this.loginForm.get('password')?.value ? '***' : 'no presente'
      }
    });

    if (this.loginForm.invalid) {
      if (this.loginForm.get('email')?.hasError('required') || this.loginForm.get('password')?.hasError('required')) {
        this.errorMessage = 'Por favor, completa todos los campos requeridos.';
      } else if (this.loginForm.get('email')?.hasError('email')) {
        this.errorMessage = 'Por favor, ingresa un correo electrónico válido.';
      } else {
        this.errorMessage = 'Por favor, verifica los datos ingresados.';
      }
      return;
    }

    const formValues = this.loginForm.value;
    const email = formValues.email?.trim();
    const password = formValues.password?.trim();

    if (!email || !password) {
      this.errorMessage = 'Los campos no pueden estar vacíos o contener solo espacios.';
      return;
    }

    console.log('Intentando login con:', { email, password: '***' });

    this.authService.login(email, password).subscribe({
      next: (response) => {
        console.log('Login exitoso, redirigiendo...');
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        console.error('Error completo:', err);
        if (err.status === 400) {
          this.errorMessage = err.error?.message || 'Datos de login incorrectos. Por favor verifica tu email y contraseña.';
        } else if (err.status === 401) {
          this.errorMessage = 'Credenciales incorrectas';
        } else {
          this.errorMessage = err.message || 'Error en la autenticación. Por favor intenta nuevamente.';
        }
      }
    });
  }
}
