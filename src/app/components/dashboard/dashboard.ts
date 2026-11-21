import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { App } from '../../app';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, FontAwesomeModule],
  templateUrl: './dashboard.html',
})
export class AppDashboard {
  readonly app = inject(App);
}
