import { Component, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { App } from '../../app';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './accounts.html',
})
export class AppAccounts {
  readonly app = inject(App);
}
