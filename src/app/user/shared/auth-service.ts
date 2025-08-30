import { inject, Injectable, signal } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RedirectCommand, Router, RouterStateSnapshot } from '@angular/router';

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

export const authenticatedToActivate: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  if(!authService.isLoggedIn()){
    const loginPath = router.parseUrl("/login");
    return new RedirectCommand(loginPath, {
      skipLocationChange: true
    });
  }
  return true;
}
