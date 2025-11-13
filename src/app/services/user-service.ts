import { inject, Injectable } from '@angular/core';
import { UserInfo } from '../models/user-info';
import { AuthService } from './auth-service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { LoginResponse } from '../models/login-response';
import { FormError } from '../helpers/form-error';

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

  getUser(): UserInfo | undefined {
    const userId = this.handleAuthentication();
    return userId !== undefined
      ? users.find((user) => user.id === userId)
      : undefined;
  }

  checkUsernameUnique(username: string): boolean {
    const userId = this.authService.getId();
    const userWithUserName = users.find((user) => user.username === username);
    return !userWithUserName || userWithUserName.id === userId;
  }

  register(user: UserInfo): Observable<boolean> {
    return this.http
      .post(`${environment.apiUrl}/register`, user, { responseType: 'text' })
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
      .post<LoginResponse>(`${environment.apiUrl}/login`, credentials)
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

  private getLargesUserId(): number {
    return users.reduce((acc, cur) => (acc.id < cur.id ? cur : acc)).id;
  }

  checkPasswordMatches(password: string): boolean {
    const user = this.getUser();
    if (user === undefined) return false;
    return user.password === password;
  }

  updateUser(user: UserInfo): UserInfo | undefined {
    const userId = this.handleAuthentication();
    if (userId === undefined) return undefined;
    const userIndex = users.findIndex((user) => user.id === userId);
    if (userIndex < 0) return undefined;
    users[userIndex].username = user.username;
    users[userIndex].email = user.email;
    if (user.password !== '') users[userIndex].password = user.password;
    return users[userIndex];
  }

  //stand-in for proper 401 http response
  handleAuthentication(): number | undefined {
    const userId = this.authService.getId();
    const idValid =
      userId !== undefined && users.some((user) => user.id === userId);
    if (!idValid) {
      this.authService.deleteId();
      this.router.navigate(['/login']);
    }
    return userId;
  }
}
