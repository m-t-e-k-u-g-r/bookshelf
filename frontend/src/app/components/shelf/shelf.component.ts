import {Component, inject, OnInit, signal} from '@angular/core';
import {BookComponent} from '../book/book.component';
import {BookService} from '../../services/book.service';
import {ShelfService} from '../../services/shelf.service';
import {ActivatedRoute} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Book} from '../../models/book.type';
import {SharedService} from '../../services/shared.service';

@Component({
  selector: 'app-shelf',
  imports: [BookComponent, FormsModule],
  template: `
    <div>
      <h2>@if (shelfId) {
        {{ shelfId }}
      } @else {
        {{ shelf() }}
      }</h2>
      <div class="menu">
        <select class="select" [(ngModel)]="sortBy" (ngModelChange)="sortBy.set($event)">
          <option value="title">Title</option>
          <option value="author">Author</option>
        </select>
      </div>
      <section class="shelf">
        @if (shelfId == undefined) {
          @if (sortedBooks.length !== 0) {
            @for (book of sortedBooks; track book.isbn) {
              @if (shelfId == book.shelf) {
                <app-book [book]="book"/>
              }
            }
          } @else {
            <h2>No books yet.
              <a (click)="this.sharedService.updateBookPrompt(true)">
                Add Book
              </a>
            </h2>
          }
        } @else {
          @for (book of sortedBooks; track book.isbn) {
            <app-book [book]="book"/>
          }
        }
      </section>
    </div>
  `,
  styleUrl: './shelf.component.css',
})
export class ShelfComponent implements OnInit {
  bookService = inject(BookService);
  shelfService = inject(ShelfService);
  sharedService = inject(SharedService);
  shelf = signal('Books')
  shelfId?: string;
  sortBy = signal<'title' | 'author'>('title');

  get sortedBooks(): (Book & { shelf?: string })[] {
    let books: (Book & { shelf?: string })[] = this.shelfId !== undefined
      ? this.shelfService.shelvedBooks().filter(b => b.shelf === this.shelfId)
      : this.bookService.books();

    return [...books].sort((a, b) => {
      const key = this.sortBy();
      return a[key].localeCompare(b[key]);
    });
  }

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.shelfId = params.get('shelfId') ?? undefined;
    })
  }
}
