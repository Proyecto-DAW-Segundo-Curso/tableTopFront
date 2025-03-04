import { Routes } from '@angular/router';
// import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateEventComponent } from './create-event/create-event.component';
import { EditEventComponent } from './edit-event/edit-event.component';
import { ParticipantsComponent } from './participants/participants.component';

export const routes: Routes = [
    // { path: '', component: AppComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'create-event', component: CreateEventComponent },
    { path: 'edit-event', component: EditEventComponent },
    { path: 'participants-list', component: ParticipantsComponent}
];
