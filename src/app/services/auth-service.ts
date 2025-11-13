import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private TOKEN_KEY = 'authToken';
  private EXPIRATION_KEY = 'tokenExpiration';

  router = inject(Router);
  isLoggedIn = signal<boolean>(false);

  constructor() {
    this.isLoggedIn.set(this.getToken() !== null);
  }

  getToken(): string | null {
    const expirationString = localStorage.getItem(this.EXPIRATION_KEY);
    if (expirationString === null) return null;
    const expirationDate = new Date(JSON.parse(expirationString));
    if (expirationDate < new Date()) {
      this.deleteToken();
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string, expiration: number) {
    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + expiration * 1000);
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.EXPIRATION_KEY, JSON.stringify(expirationDate));
    this.isLoggedIn.set(true);
  }

  deleteToken() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EXPIRATION_KEY);
    this.isLoggedIn.set(false);
  }

  // TODO remove these
  getId(): number | undefined {
    return 1;
  }

  setId(id: number) {
    this.isLoggedIn.set(true);
  }

  deleteId() {
    this.isLoggedIn.set(false);
  }
}
