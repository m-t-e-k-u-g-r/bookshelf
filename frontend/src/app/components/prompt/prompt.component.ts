import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

@Component({
  selector: 'app-prompt-component',
  template: `
    @if (open) {
      <div class="dialog_overlay">
        <div class="dialog-box">
          <h2>{{ title }}</h2>
          <p>{{ message }}</p>
          <mat-form-field appearance="fill">
            <input matInput type="text" [(ngModel)]="inputValue"/>
          </mat-form-field>
          <div class="button-container">
            <button mat-flat-button color="primary" (click)="onClick()">
              Submit
            </button>
            <button mat-button (click)="handleCancel()">
              Cancel
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './prompt.component.scss',
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class PromptComponent {
  @Input() open!: boolean;
  @Input() title?: string;
  @Input() message?: string;

  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<string>();

  inputValue = '';

  onClick() {
    this.submit.emit(this.inputValue);
    this.close.emit();
  }

  handleCancel() {
    this.close.emit();
  }
}
