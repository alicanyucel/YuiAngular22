import { Component, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { App } from '../../app';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './topbar.html',
})
export class AppTopbar {
  @Input({ required: true }) app!: App;
}
