import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment} from '../../environments/environment.development';
import {Book} from '../models/book.type';
import {catchError, of, tap, throwError} from 'rxjs';
import {removeHyphen} from '../utils/utils';
import {ToastrService} from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  baseUrl = environment.apiUrl + 'db/books/';
  http = inject(HttpClient);
  toastr = inject(ToastrService);
  books = signal<Book[]>([]);

  getBooks() {
    return this.http.get<Book[]>(this.baseUrl)
      .pipe(
        catchError(err => {
          console.error('Failed to load books', err);
          this.toastr.error('Books could not have been loaded', 'Error');
          this.books.set([]);
          return of([]);
        })
      ).subscribe(books => {
        this.books.set(books);
      })
  }

  addBook(isbn: string) {
    const cleanIsbn = removeHyphen(isbn);

    return this.http.post(this.baseUrl + cleanIsbn, {
    }).pipe(
      tap(() => {
        this.toastr.success(`Book with ISBN ${isbn} successfully added`, 'Success');
      }),
      catchError(err => {
        console.error('Failed to add book', err);
        this.toastr.error(`Failed to add book with ISBN ${isbn}`, 'Error');
        return throwError(() => err);
      })
    );
  }

  addBatch(batch: string[]) {
    if (batch.length <= 0) return throwError(() => 'Empty batch');
    return this.http.post(this.baseUrl + 'batch',
      { isbns: batch },
      {headers: {'Content-Type': 'application/json'}}
    ).pipe(
      tap(() => {
        this.toastr.success(`Batch of ${batch.length} books successfully added`, 'Success');
      }),
      catchError(err => {
        console.error('Failed to add batch', err);
        this.toastr.error('Failed to add batch of books', 'Error');
        return throwError(() => err);
      })
    )
  }

  deleteBook(title: string, isbn: string) {
    const confirmed = confirm(`Delete book ${title}?`);
    if (!confirmed) return;

    return this.http.delete(this.baseUrl + isbn)
      .pipe(
        tap(() => {
          this.toastr.success(`Book "${title}" successfully deleted`, 'Success');
        }),
        catchError(err => {
          console.error('Failed to delete book', err);
          this.toastr.error(`Failed to delete book "${title}"`, 'Error');
          return throwError(() => err);
        })
      );
  }
}
