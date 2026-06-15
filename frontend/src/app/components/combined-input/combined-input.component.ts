import {Component, EventEmitter, inject, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BookService} from '../../services/book.service';

@Component({
  selector: 'app-combined-input',
  imports: [
    FormsModule
  ],
  template: `
    <div class="combined_input">
        <textarea
            wrap="soft"
            [(ngModel)]="content"
        ></textarea>
        <p>Please enter one ISBN per line</p>
        <input
            type="file"
            accept=".csv,.txt"
            (change)="onFileChange($event)"
        />
        <div class="button-container">
          <button (click)="addBatch()">Add batch</button>
          <button (click)="onClose()">Close</button>
        </div>
    </div>
  `,
  styleUrl: './combined-input.component.css',
})
export class CombinedInputComponent {
  content = '';
  bookService = inject(BookService);
  @Output() close = new EventEmitter<void>();

  async onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;

    if (!input.files?.length) return;

    const file = input.files[0];
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
    alert('lines: ' + JSON.stringify({isbns: lines}));
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
