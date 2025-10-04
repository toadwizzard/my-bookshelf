import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  router = inject(Router);
  isLoggedIn = signal<boolean>(false);

  constructor(){
    this.isLoggedIn.set(this.getId() !== undefined)
  }

  getId(): number | undefined {
    const userIdString = localStorage.getItem("userId");
    const userId = userIdString ? parseInt(userIdString) : NaN;
    return isNaN(userId) ? undefined : userId;
  }

  setId(id: number){
    localStorage.setItem("userId", id.toString());
    this.isLoggedIn.set(true);
  }

  deleteId(){
    localStorage.removeItem("userId");
    this.isLoggedIn.set(false);
  }
}
