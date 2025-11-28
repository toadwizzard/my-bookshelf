import { inject, Injectable } from '@angular/core';
import { UserInfo } from '../models/user-info';
import { AuthService } from './auth-service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { HttpClient, HttpContext } from '@angular/common/http';
import { catchError, map, Observable, tap } from 'rxjs';
import { LoginResponse } from '../models/login-response';
import { FormError } from '../helpers/form-error';
import { AUTH_ENABLED } from '../interceptors/auth-interceptor';

interface UserInfoWithId extends UserInfo {
  id: number;
}

const users: UserInfoWithId[] = [
  {
    id: 2,
    username: 'admin',
    email: 'q@q.com',
    password: 'admin',
  },
  {
    id: 1,
    username: 'user',
    email: 'w@w.com',
    password: 'password',
  },
];

@Injectable({
  providedIn: 'root',
})
export class UserService {
  authService = inject(AuthService);
  router = inject(Router);
  http = inject(HttpClient);

  getUser(): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${environment.apiUrl}/profile`);
  }

  checkUsernameUnique(username: string): boolean {
    const userId = this.authService.getId();
    const userWithUserName = users.find((user) => user.username === username);
    return !userWithUserName || userWithUserName.id === userId;
  }

  register(user: UserInfo): Observable<boolean> {
    return this.http
      .post(`${environment.apiUrl}/register`, user, {
        responseType: 'text',
        context: new HttpContext().set(AUTH_ENABLED, false),
      })
      .pipe(
        map((res) => true),
        catchError((err) => {
          if (err.status === 400) {
            const error = new FormError(
              err.error?.message,
              err.error?.errors?.map((e: { path: string; msg: string }) => ({
                field: e.path,
                message: e.msg,
              })) ?? []
            );
            throw error;
          }
          throw err;
        })
      );
  }

  login(credentials: {
    username: string;
    password: string;
  }): Observable<boolean> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/login`, credentials, {
        context: new HttpContext().set(AUTH_ENABLED, false),
      })
      .pipe(
        map((res) => {
          this.authService.setToken(res.token, res.expiresIn);
          return true;
        }),
        catchError((err) => {
          if (err.status === 400) throw new Error(err.error?.message);
          throw err;
        })
      );
  }

  updateUser(
    user: UserInfo & { newPassword?: string; oldPassword: string }
  ): Observable<UserInfo> {
    return this.http
      .patch<UserInfo>(`${environment.apiUrl}/profile`, user)
      .pipe(
        catchError((err) => {
          if (err.status === 400) {
            const error = new FormError(
              err.error?.message,
              err.error?.errors?.map((e: { path: string; msg: string }) => ({
                field: e.path === 'newPassword' ? 'password' : e.path,
                message: e.msg,
              })) ?? []
            );
            throw error;
          }
          throw err;
        })
      );
  }

  deleteUser(): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/profile`).pipe(
      tap({
        next: (value) => {
          this.authService.deleteToken();
        },
      })
    );
  }
}
