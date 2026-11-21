import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { App } from '../../app';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [FormsModule, FontAwesomeModule],
  templateUrl: './reports.html',
})
export class AppReports {
  readonly app = inject(App);
}
