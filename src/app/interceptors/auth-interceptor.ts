import {
  HttpContextToken,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { catchError, EMPTY } from 'rxjs';
import { Router } from '@angular/router';

export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) {
  if (req.context.get(AUTH_ENABLED)) {
    const authService = inject(AuthService);
    const router = inject(Router);
    const token = authService.getToken();
    let cloned = req;
    if (token !== null) {
      cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      });
    }
    return next(cloned).pipe(
      catchError((err) => {
        if (err.status === 401) {
          authService.deleteToken();
          router.navigate(['/login']);
          return EMPTY;
        }
        throw err;
      })
    );
  }
  return next(req);
}

export const AUTH_ENABLED = new HttpContextToken<boolean>(() => true);
