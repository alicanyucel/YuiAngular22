import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { App } from '../../app';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [FormsModule, FontAwesomeModule],
  templateUrl: './customers.html',
})
export class AppCustomers {
  readonly app = inject(App);
}
