import { Routes } from '@angular/router';
// import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateEventComponent } from './create-event/create-event.component';
import { EditEventComponent } from './edit-event/edit-event.component';
import { ParticipantsComponent } from './participants/participants.component';
import { EventosComponent } from './eventos/eventos.component';
import { authGuard, loginGuard } from './guards/auth.guard';
import { AuthService } from './auth.service';
import { map } from 'rxjs';

export const routes: Routes = [
  // { path: '', component: AppComponent },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard]
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [loginGuard]
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'create-event', 
    component: CreateEventComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'edit-event', 
    component: EditEventComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'participants-list', 
    component: ParticipantsComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'eventos', 
    component: EventosComponent,
    canActivate: [authGuard]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
