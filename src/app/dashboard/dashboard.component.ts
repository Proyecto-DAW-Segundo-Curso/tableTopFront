import { Component } from '@angular/core';
import { EventosComponent } from '../eventos/eventos.component';

@Component({
  selector: 'app-dashboard',
  imports: [EventosComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
