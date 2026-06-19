import {Component, EventEmitter, inject, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BookService} from '../../services/book.service';

import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-combined-input',
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltip,
    MatIcon
  ],
  template: `
    <div class="combined_input">
        <mat-form-field appearance="fill" style="width: 100%;">
          <mat-label>ISBNs</mat-label>
          <textarea
              matInput
              wrap="soft"
              rows="10"
              [(ngModel)]="content"
              placeholder="Please enter one ISBN per line"
          ></textarea>
        </mat-form-field>
        <input #upload
            hidden
            type="file"
            accept=".csv,.txt"
            (change)="onFileChange($event)"
            style="margin-bottom: 16px;"
        />
        <button mat-icon-button (click)="upload.click()" matTooltip="Upload file">
          <mat-icon>upload</mat-icon>
        </button>
        <div class="button-container">
          <button mat-flat-button color="primary" (click)="addBatch()">Add batch</button>
          <button mat-button (click)="onClose()">Close</button>
        </div>
    </div>
  `,
  styleUrl: './combined-input.component.scss',
})
export class CombinedInputComponent {
  content = '';
  bookService = inject(BookService);
  @Output() close = new EventEmitter<void>();

  async onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;

    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file) return;
    const content = await file.text();

    const lines = content
      .split(/[\r\n,;]+/)
      .map(l => l.trim())
      .filter(l => l !== '');
    this.content = lines.join('\n');
  }

  async addBatch() {
    const lines: string[] = this.content
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l !== '');
    this.bookService.addBatch(lines).subscribe({
      next: () => {
        console.log('Batch added');
      },
      error: (err) => {
        console.error('Failed to add batch', err);
      }
    });
    this.close.emit();
  }

  onClose() {
    this.close.emit();
  }
}
