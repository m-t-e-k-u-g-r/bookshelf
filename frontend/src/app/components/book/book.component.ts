import {Component, ElementRef, inject, Input, signal, ViewChild} from '@angular/core';
import {Book} from '../../models/book.type';
import {NgOptimizedImage} from '@angular/common';
import {KebabMenuComponent, MenuItem} from '../kebab-menu/kebab-menu.component';
import {BookService} from '../../services/book.service';
import {ShelfService} from '../../services/shelf.service';

@Component({
  selector: 'app-book',
  imports: [
    NgOptimizedImage,
    KebabMenuComponent
  ],
  template: `
    <div class="book">
      <img
        ngSrc="{{ book.img_url }}"
        priority
        height="640"
        width="400"
        alt="\`{{ book.title }} by {{ book.author }}\`"
      />
      <div class="book_content">
        <p class="title">{{ book.title }}</p>
        <div class="meta">
          <p class="author">{{ book.author }}</p>
          <p class="publishYear">{{ book.publish_year }}</p>
          <p class="isbn">{{ book.isbn_h }}</p>
        </div>
        <app-kebab-menu
          [items]="menuItems"
        />
      </div>
      <dialog #shelfSelection>
        <div>
          <h3>Edit shelves for "{{book.title}}"</h3>
          <div class="dialog_body">
            @for (shelf of shelfService.shelfNames(); track shelf) {
              <div style="margin-bottom: 10px">
                <label>
                  <input
                    #checkbox
                    type="checkbox"
                    [checked]="shelves().includes(shelf)"
                    (change)="handleShelfChange(shelf, checkbox.checked)"
                  />
                  {{ shelf }}
                </label>
              </div>
            }
            <button (click)="handleSave()">
              Close
            </button>
          </div>
        </div>
      </dialog>
    </div>
  `,
  styleUrl: './book.component.css',
})
export class BookComponent {
  @Input() book!: Book;
  @ViewChild('shelfSelection') dialog!: ElementRef<HTMLDialogElement>;
  bookService = inject(BookService);
  shelfService = inject(ShelfService);
  shelves = signal<string[]>([]);

  openShelfSelection() {
    const shelfData = this.shelfService.shelvedBooks()
      .filter(b => b.isbn === this.book.isbn)
      .map(b => b.shelf);
    this.shelves.set(shelfData);
    this.dialog.nativeElement.showModal();
  }

  handleShelfChange(shelf: string, isChecked: boolean) {
    if (isChecked) {
      if (!this.shelves().includes(shelf)) this.shelves.set([...this.shelves(), shelf]);
    } else {
      this.shelves.set(this.shelves().filter(s => s !== shelf));
    }
  }

  handleSave() {
    this.shelfService.editShelvesOfBook(this.book.isbn, this.shelves())
      .subscribe({
        next: () => {
          this.shelfService.getShelvedBooks();
          this.shelfService.getSidebarData();
          this.dialog.nativeElement.close();
        },
        error: (err) => {
          console.error('Failed to save shelves', err);
        }
      });
  }

  handleBookDelete() {
    this.bookService
      .deleteBook(this.book.title, this.book.isbn)?.subscribe({
      next: () => {
        this.bookService.getBooks();
        console.log(`Book deleted`);
      },
      error: (err) => {
        console.error('Failed to delete book', err);
      }
    })
  }

  menuItems: MenuItem[] = [
    {label: 'Delete', action: () => {this.handleBookDelete()}},
    {label: 'Edit shelves', action: () => {this.openShelfSelection()}}
  ]
}
