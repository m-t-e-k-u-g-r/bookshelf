import {Injectable, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment} from '../../environments/environment.development';
import {BookWithShelf} from '../models/book.type';
import {catchError, of, tap, throwError} from 'rxjs';
import {SidebarData} from '../models/sidebardata.type';
import {ToastrService} from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class ShelfService {
  baseUrl = environment.apiUrl + 'db/shelves/'
  http = inject(HttpClient);
  toastr = inject(ToastrService);

  shelvedBooks = signal<BookWithShelf[]>([]);
  shelfNames = signal<string[]>([]);
  sidebarData = signal<SidebarData[]>([]);

  getShelvedBooks() {
    return this.http.get<BookWithShelf[]>(this.baseUrl)
      .pipe(
        catchError(err => {
          console.error('Failed to load shelved books', err);
          this.toastr.error('Failed to load shelved books', 'Error');
          this.shelvedBooks.set([]);
          return of([]);
        })
      ).subscribe(books => {
        this.shelvedBooks.set(books);
      });
  }

  getAllShelves() {
    return this.http.get<string[]>(this.baseUrl + 'names')
      .pipe(
        catchError(err => {
          console.error('Failed to load shelf names', err);
          this.toastr.error('Shelf names could not be loaded', 'Error');
          return of([]);
        })
      ).subscribe(shelves => {
        this.shelfNames.set(shelves);
      });
  }

  getShelvesOfBook(isbn: string) {
    return this.http.get<string[]>(this.baseUrl + 'b/' + isbn)
      .pipe(
        catchError(err => {
          console.error(`Failed to load shelves of book ${isbn}`, err);
          return [];
        })
      );
  }

  getSidebarData() {
    return this.http.get<SidebarData[]>(this.baseUrl + 'sidebar')
      .pipe(
        catchError(err => {
          console.error('Failed to load sidebar data', err);
          this.toastr.error('Failed to load sidebar data', 'Error');
          this.sidebarData.set([]);
          return of([]);
        })
      ).subscribe(sidebarData => {
        this.sidebarData.set(sidebarData);
      });
  }

  createShelf(shelfName: string) {
    return this.http.post(this.baseUrl + shelfName, {  })
      .pipe(
        tap(() => {
          this.toastr.success(`Shelf "${shelfName}" successfully created`, 'Success');
        }),
        catchError(err => {
          console.error('Failed to create shelf', err);
          this.toastr.error(`Failed to create shelf "${shelfName}"`, 'Error');
          return throwError(() => err);
        })
      );
  }

  renameShelf(oldName: string, newName: string) {
    return this.http.put(this.baseUrl,
      { oldShelfName: oldName, newShelfName: newName},
      { headers: {'Content-Type': 'application/json'} }
    ).pipe(
      tap(() => {
        this.toastr.success(`Shelf "${oldName}" renamed to "${newName}"`, 'Success');
      }),
      catchError(err => {
        console.log('Failed to rename shelf', err);
        this.toastr.error(`Failed to rename shelf "${oldName}"`, 'Error');
        return throwError(() => err);
      })
    );
  }

  deleteShelf(shelfName: string) {
    return this.http.delete(this.baseUrl + shelfName)
      .pipe(
        tap(() => {
          this.toastr.success(`Shelf "${shelfName}" successfully deleted`, 'Success');
        }),
        catchError(err => {
          console.error('Failed to delete shelf', err);
          this.toastr.error(`Failed to delete shelf "${shelfName}"`, 'Error');
          return throwError(() => err);
        })
      );
  }

  editShelvesOfBook(isbn: string, shelves: string[]) {
    return this.http.post(this.baseUrl,
      { isbn: isbn, shelves: shelves},
      { headers: {'Content-Type': 'application/json'} }
    ).pipe(
      tap(() => {
        this.toastr.success('Shelf assignments updated', 'Success');
      }),
      catchError(err => {
        console.error('Failed to edit shelves', err);
        this.toastr.error('Failed to update shelf assignments', 'Error');
        return throwError(() => err);
      })
    );
  }
}
