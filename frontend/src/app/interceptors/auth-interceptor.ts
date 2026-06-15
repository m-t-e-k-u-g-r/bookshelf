import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import {inject} from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();
  const headers: { [name: string]: string } = token ? { Authorization: `Bearer ${token}` } : {};
  const authRequest = req.clone({
    withCredentials: true,
    setHeaders: headers
  });
  return next(authRequest);
};
