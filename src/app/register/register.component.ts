import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

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
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    // private router: Router
  ) {
    this.registerForm = this.fb.group({
      userName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Método para manejar el envío del formulario
  async onSubmit() {
    console.log('Estado del formulario:', this.registerForm.value);

    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      try {
        const { email, password, userName } = this.registerForm.value;
        await this.authService.register(email, password, userName);
      } catch (err: any) {
        this.errorMessage = 'Error al registrarse: ' + (err.message || 'Intente nuevamente');
      }finally{
        this.loading = false;
      }
    }    
  }
}
