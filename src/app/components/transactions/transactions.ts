import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { App } from '../../app';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [DatePipe, FormsModule, FontAwesomeModule],
  templateUrl: './transactions.html',
})
export class AppTransactions {
  readonly app = inject(App);
  readonly Math = Math;
}
