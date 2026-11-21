import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { App } from '../../app';

@Component({
  selector: 'app-operation-modal',
  standalone: true,
  imports: [FormsModule, FontAwesomeModule],
  templateUrl: './operation-modal.html',
})
export class AppOperationModal {
  @Input({ required: true }) app!: App;
}
