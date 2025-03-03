import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { SpringAuthService } from '../spring-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private authService: SpringAuthService, private router: Router) {
    // Inicializa el formulario reactivo
    this.loginForm = this.fb.group({
      email: ['user@gmail.com', Validators.required],
      password: ['user1234', Validators.required,]
    })
  }

  // Método para manejar el envío del formulario
  onSubmit() {
    if (this.loginForm.valid) {
      // Codigo DeepSeck
      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;

      // const { email, password } = this.loginForm.value;

      // Codigo DeepSeck
      // Intenta autenticar al usuario
      //   if (this.authService.login(email, password)) {
      //     //this.router.navigate(['/dashboard']); // Redirige al dashboard
      //     console.log('Usuario autenticado');
      //     this.authService.isAuthenticated();

      //   } else {
      //     this.errorMessage = 'Email o contraseña incorrectos';
      //   }
      // } else {
      //   this.errorMessage = 'Por favor, completa el formulario correctamente';
      if (!email || !password) {
        this.errorMessage = 'Por favor, ingresa tu correo y contraseña.';
        return;
      }

      this.authService.login(email, password).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.errorMessage = err.message || 'Error en la autenticación.';
          console.error('Error en el login:', err);
        }
      })

    }
  }
}
