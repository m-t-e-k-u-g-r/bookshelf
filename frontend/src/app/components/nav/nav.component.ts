import {Component, ElementRef, inject, signal, ViewChild} from '@angular/core';
import {PromptComponent} from '../prompt/prompt.component';
import {BookService} from '../../services/book.service';
import {CombinedInputComponent} from '../combined-input/combined-input.component';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {formatDateYYYY_MM_DD} from '../../utils/utils';
import {FormsModule} from '@angular/forms';
import {SharedService} from '../../services/shared.service';
import {ToastrService} from 'ngx-toastr';

import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-nav',
  imports: [
    PromptComponent,
    CombinedInputComponent,
    FormsModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <div>
      <nav>
        <button mat-button (click)="openPrompt()">
          Add Book
        </button>
        <button mat-button (click)="openDialog()">
          Add Batch
        </button>
        <button mat-button (click)="openExport()">
          Export
        </button>
        <button mat-icon-button (click)="logout()">
          <mat-icon>logout</mat-icon>
        </button>
      </nav>
      <app-prompt-component
        [open]="promptOpen()"
        (close)="onClose()"
        [title]="'Add Book'"
        [message]="'Enter ISBN'"
        (submit)="addBook($event)"
      />
      <dialog #combinedInput>
        <app-combined-input
          (close)="onCloseDialog()"
        />
      </dialog>
      <dialog #exportDialog class="export_dialog">
        <h3>Export data</h3>
        <mat-form-field appearance="fill">
          <mat-label>Format</mat-label>
          <mat-select [(ngModel)]="selectedFormat">
            @for (format of exportFormats; track format) {
              <mat-option [value]="format">
                {{ format }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
        @if (selectedFormat === 'csv') {
          <br/>
          <mat-form-field appearance="fill" style="width: 100px;">
            <mat-label>Delimiter</mat-label>
            <input
              matInput
              type="text"
              [(ngModel)]="delimiter"
            />
          </mat-form-field>
        }
        <div class="export_options">
          @for (a of exportableAttributes; track a) {
            <mat-checkbox
                [checked]="attributes_to_export().includes(a)"
                (change)="selectAttribute(a, $event.checked)"
            >
              {{ a }}
            </mat-checkbox>
          }
        </div>
        <div class="button-container">
          <button mat-flat-button color="primary" (click)="export()">
            Export
          </button>
          <button mat-button (click)="closeExport()">
            Close
          </button>
        </div>
      </dialog>
    </div>
  `,
  styleUrl: './nav.component.scss',
})
export class NavComponent {
  bookService = inject(BookService);
  authService = inject(AuthService);
  sharedService = inject(SharedService);
  toastr = inject(ToastrService);
  router = inject(Router);
  promptOpen = this.sharedService.addBookPromptOpen;
  @ViewChild('combinedInput') dialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('exportDialog') exportDialog!: ElementRef<HTMLDialogElement>;
  exportableAttributes = ['isbn', 'isbn_h', 'title', 'author', 'publish_year', 'read_status'];
  exportFormats = ['json', 'csv'];
  attributes_to_export = signal<string[]>([]);
  delimiter = ',';
  selectedFormat = 'json';

  selectAttribute(attribute: string, checked: boolean) {
    if (checked) {
      if (!this.attributes_to_export().includes(attribute)) this.attributes_to_export.set([...this.attributes_to_export(), attribute]);
    } else {
      this.attributes_to_export.set(this.attributes_to_export().filter(a => a !== attribute));
    }
  }

  logout() {
    console.log('Logging out');
    this.authService.logout().subscribe({
      next: () => {this.router.navigate(['/login'])},
    });
  }
  export() {
    const date = formatDateYYYY_MM_DD();
    const data = this.bookService.books();
    const filteredData = data.map(b =>
      Object.fromEntries(
        Object.entries(b).filter(([key]) => this.attributes_to_export().includes(key))
      )
    );
    let blob: Blob;
    const a = document.createElement('a');
    if (this.selectedFormat === 'json') {
      const json = JSON.stringify(filteredData, null, 2);

      blob = new Blob([json], {type: 'application/json'});
      a.download = `${date}_books.json`;
    } else {
      const key = filteredData[0];
      if (!key) return;
      const columnNames = Object.keys(key);
      let csvContent = columnNames.join(this.delimiter == '' ? ',' : this.delimiter) + '\n';
      let rows: string[] = [];

      filteredData.forEach((e) => {
        let values: string[] = [];

        columnNames.forEach((k) => {
          let val = e[k];

          if (val !== undefined && val !== null) {
            val = String(val);
          } else {
            val = '';
          }
          values.push(val);
        });
        rows.push(values.join(this.delimiter));
      });
      csvContent += rows.join('\n');

      blob = new Blob([csvContent], {type: 'text/csv'});
      a.download = `${date}_books.csv`;
    }
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
    this.closeExport();
    this.toastr.success('Export successful')
  }

  openPrompt() {
    this.sharedService.updateBookPrompt(true);
  }
  openDialog() {
    this.dialog.nativeElement.showModal();
  }
  openExport() {
    this.exportDialog.nativeElement.showModal();
  }

  addBook(isbn: string) {
    this.bookService.addBook(isbn).subscribe({
      next: () => {
        console.log('Book added');
      },
      error: (err) => {
        console.error('Failed to add book', err);
      }
    });
    this.sharedService.updateBookPrompt(false);
  }

  onClose() {
    this.sharedService.updateBookPrompt(false);
  }
  onCloseDialog() {
    this.dialog.nativeElement.close();
  }
  closeExport() {
    this.exportDialog.nativeElement.close();
  }
}
