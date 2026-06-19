import {inject, Injectable, signal} from '@angular/core';
import {environment} from '../../environments/environment.development';
import {HttpClient} from '@angular/common/http';
import {catchError, switchMap, tap, throwError} from 'rxjs';
import {ToastrService} from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseUrl = environment.apiUrl + 'auth';
  http = inject(HttpClient);
  toastr = inject(ToastrService);
  isLoggedIn = signal<boolean>(false);
  accessToken = signal<string | null>(null);

  getAccessToken() {
    return this.accessToken();
  }

  signup(email: string, password: string) {
    return this.http.post(this.baseUrl + '/signup',
      { email: email, password: password },
      {
        observe: 'response',
        withCredentials: true
      }
    ).pipe(
      tap(() => {
        this.isLoggedIn.set(true);
        this.toastr.success(`Registration successful for ${email}`, 'Success');
      }),
      catchError(err => {
        console.error('Failed to signup user:', err);
        this.toastr.error(`Registration failed for ${email}`, 'Error');
        return throwError(() => err);
      })
    );
  }

  login(email: string, password: string) {
    return this.http.post(this.baseUrl + '/login',
      { email: email, password: password },
      {
        observe: 'response',
        withCredentials: true
      }
    ).pipe(
      switchMap(() => this.refresh()),
      tap(() => {
        this.isLoggedIn.set(true);
        this.toastr.success(`Login successful as ${email}`, 'Success');
      }),
      catchError(err => {
        console.error('Failed to log in user:', err);
        this.toastr.error(`Login failed for ${email}`, 'Error');
        return throwError(() => err);
      })
    );
  }

  refresh() {
    return this.http.post<{ accessToken: string }>(this.baseUrl + '/refresh', {},
      { withCredentials: true }
    ).pipe(
      tap(res => {
        this.accessToken.set(res.accessToken);
        this.isLoggedIn.set(true);
      }),
      catchError(err => {
        switch(err.status) {
          case 401:
            console.error('Refresh called without a token (frontend bug)', err);
            break;
          case 403:
            this.isLoggedIn.set(false);
            this.accessToken.set(null);
            this.toastr.warning('Please log in again', 'Session expired');
            break;
          default:
            console.error('Failed to refresh token:', err);
        }
        return throwError(() => err);
      })
    );
  }

  logout() {
    return this.http.delete(this.baseUrl + '/logout').
    pipe(
      tap(() => {
        this.accessToken.set(null);
        this.isLoggedIn.set(false);
        this.toastr.info('Successfully logged out', 'Information');
      }),
      catchError(err => {
        console.error('Failed to log out:', err);
        this.toastr.error('Logout failed', 'Error');
        return throwError(() => err);
      })
    );
  }
}
